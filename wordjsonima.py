from docx import Document
import os
import zipfile
import json
import re

# Función para extraer imágenes de un archivo docx
def extraer_imagenes(docx_path, carpeta_destino="images"):
    with zipfile.ZipFile(docx_path, "r") as docx:
        # Crear carpeta para guardar imágenes si no existe
        if not os.path.exists(carpeta_destino):
            os.makedirs(carpeta_destino)

        # Buscar las imágenes en la carpeta 'word/media'
        imagenes = []
        for archivo in docx.namelist():
            if archivo.startswith("word/media/"):
                imagen_nombre = os.path.basename(archivo)
                imagen_destino = os.path.join(carpeta_destino, imagen_nombre)
                with open(imagen_destino, "wb") as f:
                    f.write(docx.read(archivo))
                imagenes.append(imagen_destino)  # Guardar la ruta de la imagen

        return imagenes

# Cargar el documento Word
documento = Document("preguntas.docx")

preguntas = []
pregunta_actual = None
opciones_actuales = []
respuestas_correctas = []
imagenes_en_pregunta = []

# Expresión regular más flexible para detectar preguntas
patron_pregunta = re.compile(r"^\d{1,2}[-.\s]*\s?")

# Extraer imágenes del documento
imagenes = extraer_imagenes("preguntas.docx")

# Iterar a través de los párrafos del documento
for i, parrafo in enumerate(documento.paragraphs):
    texto = parrafo.text.strip()

    if not texto:
        continue  # Saltar líneas vacías

    # Detectar imagen incrustada en el párrafo
    for run in parrafo.runs:
        if run.element.tag.endswith('}r') and run._r.getchildren():  # Verificar si tiene una imagen incrustada
            for child in run._r.getchildren():
                if child.tag.endswith('}drawing'):  # Detectar el objeto de la imagen
                    # Asociar una imagen a esta pregunta
                    imagenes_en_pregunta.append(imagenes[0])  # Guardar la referencia a la imagen
                    imagenes.pop(0)  # Eliminar la imagen usada

    # Si detectamos una nueva pregunta
    if patron_pregunta.match(texto):
        if pregunta_actual:
            # Guardar la pregunta anterior
            preguntas.append({
                "pregunta": pregunta_actual.strip(),
                "opciones": opciones_actuales,
                "respuestas_correctas": list(set(respuestas_correctas)),
                "imagenes": imagenes_en_pregunta  # Incluir imágenes asociadas
            })

        # Iniciar una nueva pregunta
        pregunta_actual = texto
        opciones_actuales = []
        respuestas_correctas = []
        imagenes_en_pregunta = []

    # Si detectamos una opción de respuesta
    elif re.match(r"^[A-F][.)]\s", texto):  # Cambiado para incluir opciones de A a F
        opciones_actuales.append(texto)

        # Verificar si la opción está en negrita (es decir, es la respuesta correcta)
        for run in parrafo.runs:
            if run.bold:
                letra_opcion = texto[0]
                if letra_opcion not in respuestas_correctas:
                    respuestas_correctas.append(letra_opcion)

    else:
        # Si no es una opción, entonces es una parte de la pregunta
        if pregunta_actual:
            pregunta_actual += " " + texto

# Guardar la última pregunta en el JSON
if pregunta_actual:
    preguntas.append({
        "pregunta": pregunta_actual.strip(),
        "opciones": opciones_actuales,
        "respuestas_correctas": list(set(respuestas_correctas)),
        "imagenes": imagenes_en_pregunta
    })

# Guardar en un archivo JSON
if preguntas:
    with open("preguntas_con_imagenes.json", "w", encoding="utf-8") as f:
        json.dump(preguntas, f, indent=4, ensure_ascii=False)
    print("✅ Archivo JSON generado correctamente con", len(preguntas), "preguntas.")
else:
    print("⚠ No se encontraron preguntas en el documento.")
