from flask import Flask, render_template, request, redirect, url_for, send_from_directory
import sqlite3
from datetime import datetime
import os
import requests

app = Flask(__name__)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_db_connection():
    conn = sqlite3.connect('clientes.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    buscar = request.args.get('buscar', '')
    fecha = request.args.get('fecha', '')

    conn = get_db_connection()

    query = 'SELECT * FROM clients WHERE 1=1'
    params = []

    if buscar:
        query += ' AND (nombre LIKE ? OR producto LIKE ? OR estado LIKE ?)'
        like_str = f'%{buscar}%'
        params.extend([like_str, like_str, like_str])

    if fecha:
        query += ' AND DATE(fecha_ingreso) = ?'
        params.append(fecha)

    clientes = conn.execute(query, params).fetchall()
    conn.close()
    return render_template('index.html', clientes=clientes)


@app.route('/add_client', methods=['GET', 'POST'])
def add_client():
    if request.method == 'POST':
        nombre = request.form['nombre']
        direccion = request.form['direccion']
        telefono = request.form['telefono']
        email = request.form['email']
        producto = request.form['producto']
        falla = request.form['falla']
        estado = request.form['estado']
        fecha_ingreso = datetime.now().strftime('%Y-%m-%d')

        factura = request.files['factura']
        factura_filename = ""
        if factura and allowed_file(factura.filename):
            factura_filename = datetime.now().strftime('%Y%m%d%H%M%S_') + factura.filename
            factura.save(os.path.join(app.config['UPLOAD_FOLDER'], factura_filename))

        conn = get_db_connection()
        conn.execute('INSERT INTO clients (nombre, direccion, telefono, email, producto, falla, estado, fecha_ingreso, factura) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                     (nombre, direccion, telefono, email, producto, falla, estado, fecha_ingreso, factura_filename))
        conn.commit()
        conn.close()
        return redirect(url_for('index'))
    return render_template('add_client.html')

@app.route('/client/<int:id>')
def client_detail(id):
    conn = get_db_connection()
    cliente = conn.execute('SELECT * FROM clients WHERE id = ?', (id,)).fetchone()
    conn.close()
    return render_template('client_detail.html', cliente=cliente)

@app.route('/update_estado/<int:id>', methods=['POST'])
def update_estado(id):
    nuevo_estado = request.form['estado']
    conn = get_db_connection()
    conn.execute('UPDATE clients SET estado = ? WHERE id = ?', (nuevo_estado, id))
    cliente = conn.execute('SELECT * FROM clients WHERE id = ?', (id,)).fetchone()
    conn.commit()
    conn.close()

    if nuevo_estado == 'Finalizado':
        try:
            data = {
                "id": id,
                "nombre": cliente["nombre"],
                "producto": cliente["producto"],
                "email": cliente["email"],
                "estado": nuevo_estado
            }
            requests.post("https://luciferi.app.n8n.cloud/webhook/cliente-finalizado", json=data)
        except Exception as e:
            print("Error al notificar a n8n:", e)

    return redirect(url_for('client_detail', id=id))

@app.route('/uploads/<filename>')
def ver_factura(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    app.run(debug=True)