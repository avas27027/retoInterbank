# retoInterbank
## Introducción
Esta aplicación CLI en JavaScript (Node.js) procesa un archivo CSV de transacciones bancarias y genera un reporte con el balance final (créditos menos débitos), la transacción de mayor monto y el conteo de transacciones por tipo "Crédito" y "Débito". Para ello unicamente se debe ingresar la ruta del archivo CSV como parametro.

## Instrucciones de ejecución
1. Instalar las siguientes dependencias:

``` bash
npm init -y
npm install commander csv-parse
```

2. Verificar que el archivo sea CSV y tenga el siguiente formato

``` csv
id,tipo,monto
1,Crédito,100.00
2,Débito,50.00
3,Crédito,200.00
```

3. Posteriormente ejecutar el siguiente comando node index.js <<Ruta del archivo csv>>

## Enfoque y solución
* Se uso un enfoque modular, dividiendo las tareas en distintas funciones para tener un mejor manejo de los errores y que el codigo sea más legible.
* Para la generación del monto mayor uso un enfoque bubblesort que arroja la transacción con mayor monto y el mismo loop se uso para contar y generar el balance.
* El codigo cuenta con un manejo de errores que permite indicar al desarrollador algún error en el uso del programa.

## Estructura del proyecto
El proyecto consta de 1 función main y 4 funciones modulares.

* **setupProgram():** Se usa para configurar los parametros (ruta CSV) necesarios para ejecutar el programa.
* **readCSV():** Usa la libreria *csv* para leer el archivo. En esta función también se verifica que no haya ningún error de formato, en caso se encuentre alguno se arroja una advertencia al usuario.
* **generateReport():** Genera el balance, el conteo y la transacción mayor, en caso no encuentre transacciones arroja 0.
* **printReport():** Imprime los resultados y ajusta los decimales a 2.