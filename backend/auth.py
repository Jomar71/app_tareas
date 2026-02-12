import jwt

import datetime
from functools import wraps
from flask import request, jsonify, Blueprint
from models import db, User, bcrypt, limiter

auth_bp = Blueprint('auth', __name__)

SECRET_KEY = 'tu_clave_secreta_super_segura_cambiala' # En producción usar variable de entorno

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(" ")[1]
        
        if not token:
            return jsonify({'message': 'Token faltante'}), 401
        
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            current_user = User.query.filter_by(id=data['user_id']).first()
            if not current_user:
                return jsonify({'message': 'Usuario no encontrado'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token expirado'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token inválido'}), 401
            
        return f(current_user, *args, **kwargs)
    
    return decorated

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'message': 'Email y contraseña requeridos'}), 400
        
    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'El email ya está registrado'}), 400
        
    pw_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(email=email, password_hash=pw_hash)
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'message': 'Usuario registrado exitosamente'}), 201

@auth_bp.route('/login', methods=['POST'])
@limiter.limit("10 per minute")
def login():

    auth = request.get_json()
    if not auth or not auth.get('email') or not auth.get('password'):
        return jsonify({'message': 'Credenciales incompletas'}), 400
        
    user = User.query.filter_by(email=auth.get('email')).first()
    
    if not user or not bcrypt.check_password_hash(user.password_hash, auth.get('password')):
        return jsonify({'message': 'Email o contraseña incorrectos'}), 401
        
    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, SECRET_KEY, algorithm="HS256")
    
    return jsonify({
        'token': token,
        'user': {'email': user.email}
    })

# Simulación de recuperación de contraseña (en ambiente real enviaría un email)
@auth_bp.route('/reset-request', methods=['POST'])
def reset_request():
    data = request.get_json()
    email = data.get('email')
    user = User.query.filter_by(email=email).first()
    
    if user:
        # Aquí iría la lógica de enviar email
        return jsonify({'message': 'Se ha enviado un enlace de recuperación a tu email'}), 200
    
    return jsonify({'message': 'Si el email existe en nuestro sistema, recibirás un enlace'}), 200
