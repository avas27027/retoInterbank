
const fs = require('fs').promises;
const csv = require('csv-parse');
const { program } = require('commander');

//Clase Transaction
class Transaction {
    constructor(id, tipo, monto) {
        this.id = id;
        this.tipo = tipo;
        this.monto = Number(monto);
    }
}

//Configura el programa
function setupProgram() {
    program
        .argument('<csv_file>', 'Ruta al archivo CSV con las transacciones')
        .action(main)
        .parseAsync(process.argv);
}

//Lee las transacciones
async function readCSV(filePath) {
    const transactions = [];

    try {
        //Lee el archivo csv y lo parsea en un array
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const parser = csv.parse(fileContent, {
            columns: true,
            trim: true,
            skip_empty_lines: true,
        });

        //Se recorre el archivo
        for await (const record of parser) {
            try {
                // Validar columnas esperadas
                const expectedColumns = ['id', 'tipo', 'monto'];
                if (!expectedColumns.every(col => col in record)) {
                    throw new Error('Faltan columnas requeridas en el CSV');
                }
                const { id, tipo, monto } = record;

                //Parsear montos a numeros
                const montoNum = Number(monto);

                transactions.push(new Transaction(id, tipo, montoNum));

            }
            catch (error) {
                console.warn(`Error: procesando transacción ${record.id || 'desconocida'}. ${error}`);
            }
        }
        //Retorna una lista de transacciones
        return transactions;
    }
    catch (error) {
        console.error(`Error al leer el archivo: ${error.message}`);
        process.exit(1);
    }
}

//Genera la lógica del reporte
function generateReport(transactions) {
    let balance = 0;
    const conteo = { Crédito: 0, Débito: 0 };
    let mayor_monto = 0;
    let mayor_id = null;

    //En caso no haya transacciones retorna 0
    if (!transactions.length) {
        return {
            balance_final: 0,
            mayor_transaccion: { id: null, monto: null },
            conteo: { Crédito: 0, Débito: 0 },
        };
    }

    //Recorre todas las transacciones
    for (const trans of transactions) {
        // Suma los créditos, resta los débitos y los cuenta
        if (trans.tipo === 'Crédito') {
            balance += trans.monto;
            conteo['Crédito']++;
        } else {
            balance -= trans.monto;
            conteo['Débito']++;
        }

        // Obtiene el monto mayor por bubblesort
        if (trans.monto > mayor_monto) {
            mayor_monto = trans.monto;
            mayor_id = trans.id;
        }
    }


    return {
        balance_final: balance,
        mayor_transaccion: { id: mayor_id, monto: mayor_monto },
        conteo,
    };


}

//Imprime los datos del reporte
function printReport(report) {
    console.log('Reporte de Transacciones')
    console.log('---------------------------------------------')
    console.log('Balance Final: ', report.balance_final.toFixed(2));
    console.log(`Transacción de Mayor Monto: ID ${report.mayor_transaccion.id} - ${report.mayor_transaccion.monto}`);
    console.log(`Conteo de Transacciones: Crédito: ${report.conteo['Crédito']} Débito: ${report.conteo['Débito']}`);
}

//Funcion principal
async function main(csvFile) {
    try {
        const transactions = await readCSV(csvFile);
        const report = generateReport(transactions);
        printReport(report);
    } catch (error) {
        console.error(`Error en la ejecución: ${error.message}`);
        process.exit(1);
    }
}

setupProgram();