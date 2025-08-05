from flask import Blueprint, request, jsonify
from app.db import get_connection
from app import mail
from flask_mail import Message
from werkzeug.security import generate_password_hash

import bcrypt
import random
import string

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

# REGISTRO
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    nombre = data.get('nombre')
    correo = data.get('email')
    contrasena = data.get('password')

    if not (nombre and correo and contrasena):
        return jsonify({"success": False, "error": "Faltan campos obligatorios"}), 400

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT id FROM usuarios WHERE correo = %s", (correo,))
        if cursor.fetchone():
            return jsonify({"success": False, "error": "El correo ya está registrado"}), 409

        hashed = bcrypt.hashpw(contrasena.encode('utf-8'), bcrypt.gensalt())

        cursor.execute(
            "INSERT INTO usuarios (nombre, correo, contrasena) VALUES (%s, %s, %s)",
            (nombre, correo, hashed)
        )
        conn.commit()

        return jsonify({"success": True, "message": "Usuario registrado correctamente"})
    except Exception as e:
        print("Error:", e)
        return jsonify({"success": False, "error": "Error interno en el servidor"}), 500
    finally:
        cursor.close()
        conn.close()

# LOGIN
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    correo = data.get('email')
    contrasena = data.get('password')

    if not (correo and contrasena):
        return jsonify({"success": False, "error": "Faltan campos obligatorios"}), 400

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM usuarios WHERE correo = %s", (correo,))
        user = cursor.fetchone()

        if user and bcrypt.checkpw(contrasena.encode('utf-8'), user['contrasena'].encode('utf-8')):
            return jsonify({
                "success": True,
                "message": "Login exitoso",
                "user": {
                    "id": user['id'],
                    "nombre": user['nombre'],
                    "correo": user['correo']
                }
            })
        else:
            return jsonify({"success": False, "error": "Correo o contraseña incorrectos"}), 401
    except Exception as e:
        print("Error:", e)
        return jsonify({"success": False, "error": "Error interno en el servidor"}), 500
    finally:
        cursor.close()
        conn.close()

# CAMBIO DE CONTRASEÑA
@auth_bp.route('/change-password', methods=['POST'])
def change_password():
    data = request.get_json()
    correo = data.get('email')
    old_password = data.get('old_password')
    new_password = data.get('new_password')

    if not (correo and old_password and new_password):
        return jsonify({"success": False, "error": "Faltan campos obligatorios"}), 400

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM usuarios WHERE correo = %s", (correo,))
        user = cursor.fetchone()

        if user and bcrypt.checkpw(old_password.encode('utf-8'), user['contrasena'].encode('utf-8')):
            new_hashed = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
            cursor.execute("UPDATE usuarios SET contrasena = %s WHERE correo = %s", (new_hashed, correo))
            conn.commit()
            return jsonify({"success": True, "message": "Contraseña actualizada correctamente"})
        else:
            return jsonify({"success": False, "error": "Contraseña actual incorrecta"}), 401
    except Exception as e:
        print("Error:", e)
        return jsonify({"success": False, "error": "Error interno en el servidor"}), 500
    finally:
        cursor.close()
        conn.close()

# GENERACIÓN Y ENVÍO DE CÓDIGO
@auth_bp.route('/generate-code', methods=['POST'])
def generate_code():
    data = request.get_json()
    correo = data.get('email')

    if not correo:
        return jsonify({"success": False, "error": "Falta el correo"}), 400

    code = ''.join(random.choices(string.digits, k=6))

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            REPLACE INTO codigos_verificacion (correo, codigo, usado)
            VALUES (%s, %s, FALSE)
        """, (correo, code))
        conn.commit()

        # Envío real del correo
        subject = "Tu código de verificación"
        body = f"Hola,\n\nTu código de verificación es: {code}\n\nEste código expirará en unos minutos.\n\nSaludos."
        msg = Message(subject, recipients=[correo], body=body)

        mail.send(msg)  # ✅ Envía el correo

        return jsonify({"success": True, "message": "Código generado y enviado correctamente"}), 200

    except Exception as e:
        print("Error al generar código:", e)
        return jsonify({"success": False, "error": "Error interno"}), 500

    finally:
        cursor.close()
        conn.close()

@auth_bp.route('/verify-code', methods=['POST'])
def verify_code():
    data = request.get_json()
    email = data.get('email')
    code = data.get('code')

    if not email or not code:
        return jsonify({'success': False, 'error': 'Datos incompletos'}), 400

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT * FROM codigos_verificacion 
            WHERE correo = %s AND codigo = %s AND usado = FALSE
        """, (email, code))
        result = cursor.fetchone()

        if result:
            # Marcamos el código como usado
            cursor.execute("""
                UPDATE codigos_verificacion SET usado = TRUE 
                WHERE correo = %s AND codigo = %s
            """, (email, code))
            conn.commit()
            return jsonify({'success': True}), 200
        else:
            return jsonify({'success': False, 'error': 'Código inválido o ya usado'}), 400

    finally:
        cursor.close()
        conn.close()

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    email = data.get('email')
    new_password = data.get('new_password')

    if not email or not new_password:
        return jsonify({'success': False, 'error': 'Datos incompletos'}), 400

    hashed = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE usuarios SET contrasena = %s WHERE correo = %s
        """, (hashed, email))
        conn.commit()

        return jsonify({'success': True}), 200

    finally:
        cursor.close()
        conn.close()

