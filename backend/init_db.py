from app import app, db

# Crear las tablas
with app.app_context():
    db.create_all()
    print("Tablas creadas exitosamente.")