class Estudiante():
    def __init__(self, nombre, fila, columna, imagen=None):
        self.nombre = nombre
        self.fila = fila
        self.columna = columna
        self.imagen = imagen

    def getNombre(self):
        return self.nombre

    def getFila(self):
        return self.fila
    
    def getColumna(self):
        return self.columna

    def getImagen(self):
        return self.imagen

    def setNombre(self, nombre):
        self.nombre = nombre
    
    def setFila(self, fila):
        self.fila = fila
    
    def setColumna(self, columna):
        self.columna = columna

    def setImagen(self, imagen):
        self.imagen = imagen