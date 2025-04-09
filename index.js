
const fs = require('fs').promises;
const path = require('path');
const csv = require('csv-parse');
const { program } = require('commander');

class Transaction {
    constructor(id, tipo, monto) {
        this.id = id;
        this.tipo = tipo;
        this.monto = Number(monto);
    }
}

function setupProgram() {
    program
        .argument('<csv_file>', 'Ruta al archivo CSV con las transacciones')
        .action(main)
        .parseAsync(process.argv);
}
async function readTransactions(filePath) {
    const transactions = [];

    try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const parser = csv.parse(fileContent, {
            columns: true,
            trim: true,
            skip_empty_lines: true,
        });


        for await (const record of parser) {
            try {
                // Validar columnas esperadas
                //const expectedColumns = ['id', 'tipo', 'monto'];
                console.log(record)
                const { id, tipo, monto } = record;
                transactions.push(new Transaction(id, tipo, monto));
            }
            catch (error) {
                //console.warn(`Advertencia: Error procesando transacción ${record.id || 'desconocida'}. Ignorada.`);
            }
        }
        return transactions;
    }
    catch (error) {
        console.error(`Error al leer el archivo: ${error.message}`);
        process.exit(1);
    }
}

function generateReport(transactions) {
    let balance = 0;
    const conteo = { Crédito: 0, Débito: 0 };
    let mayor_monto = 0;
    let mayor_id = null;

    if (!transactions.length) {
        return {
            balance_final: 0,
            mayor_transaccion: { id: null, monto: null },
            conteo: { Crédito: 0, Débito: 0 },
        };
    }

    for (const trans of transactions) {
        // Actualizar balance
        if (trans.tipo === 'Crédito') {
            balance += trans.monto;
            conteo['Crédito']++;
        } else {
            balance -= trans.monto;
            conteo['Débito']++;
        }

        // Verificar transacción de mayor monto
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
function printReport(report) {
    console.log('Balance: ', report.balance_final);
    console.log('ID: ', report.mayor_transaccion.id);
    console.log('Monto: ', report.mayor_transaccion.monto);
    console.log('Crédito: ', report.conteo['Crédito']);
    console.log('Débito: ', report.conteo['Débito']);
}

async function main(csvFile) {
    try {
        const transactions = await readTransactions(csvFile);
        const report = generateReport(transactions);
        printReport(report);
    } catch (error) {
        console.error(`Error en la ejecución: ${error.message}`);
        process.exit(1);
    }
}

setupProgram();