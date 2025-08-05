from flask import Blueprint, request, jsonify

contacto_bp = Blueprint('contacto', __name__, url_prefix='/contacto')

@contacto_bp.route('/enviar', methods=['POST'])
def enviar_contacto():
    data = request.get_json()
    return jsonify({"message": "Mensaje de contacto recibido", "data": data})
