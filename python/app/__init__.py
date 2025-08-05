from flask import Flask
from flask_cors import CORS
from flask_mail import Mail

mail = Mail()  # Instancia global

def create_app():
    app = Flask(__name__)
    app.config.from_object("app.config.Config")
    CORS(app, resources={r"/*": {"origins": "*"}})

    # Configuración del correo
    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USE_SSL'] = False
    app.config['MAIL_USERNAME'] = 'tortasyani271@gmail.com'
    app.config['MAIL_PASSWORD'] = 'rfsv locq irni vfxu'
    app.config['MAIL_DEFAULT_SENDER'] = 'tortasyani271@gmail.com'

    mail.init_app(app)

    from app.routes.auth import auth_bp
    from app.routes.contacto import contacto_bp

    # Registrar rutas
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(contacto_bp)

    return app
