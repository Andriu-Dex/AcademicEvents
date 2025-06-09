const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function generarReporteEventoPDF(datos, filePath) {
    // 1. Leer plantilla HTML
    const templatePath = path.join(__dirname, '../templates/reporte_evento.html');
    let html = fs.readFileSync(templatePath, 'utf8');
    // 2. Armar tabla de inscritos
    let tabla_inscritos = datos.det_ins.map((ins, idx) => `
        <tr>
            <td>${idx + 1}</td>
            <td>${ins.ced_usu}</td>
            <td>${ins.nom_usu}</td>
            <td>${ins.ape_usu}</td>
            <td>${ins.por_asi_fin_usu ?? '-'}</td>
            ${datos.cab_eve.tip_eve === "CURSO" ? `<td>${ins.not_fin_usu ?? '-'}</td>` : ""}
            <td>${ins.est_ins}</td>
        </tr>
    `).join("");
    // 3. Reemplazar los placeholders
    html = html
        .replace('{{nombre_evento}}', datos.cab_eve.nom_eve)
        .replace('{{creador}}', `${datos.cab_eve.cre_eve.nom_usu} ${datos.cab_eve.cre_eve.ape_usu}`)
        .replace('{{duracion}}', datos.cab_eve.dur_hor_eve)
        .replace('{{fecha_inicio}}', new Date(datos.cab_eve.fec_ini_eve).toLocaleDateString())
        .replace('{{fecha_fin}}', new Date(datos.cab_eve.fec_fin_eve).toLocaleDateString())
        .replace('{{img_por_eve}}', datos.cab_eve.img_por_eve || '')
        .replace('{{tabla_inscritos}}', tabla_inscritos)
        .replace('{{columna_nota}}', datos.cab_eve.tip_eve === "CURSO" ? "<th>Nota</th>" : "");

    // 4. Generar el PDF con Puppeteer
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-web-security'] });
    const page = await browser.newPage();
    fs.writeFileSync('debug_reporte.html', html);
    await page.setContent(html, { waitUntil: 'networkidle0' });

    await page.pdf({
        path: filePath,
        format: 'A4',
        printBackground: true,
        margin: { top: 20, bottom: 20, left: 20, right: 20 }
    });

    await browser.close();
}

async function generarReporteMensualPDF(datos, filePath) {
    // 1. Leer plantilla HTML
    const templatePath = path.join(__dirname, '../templates/reporte_mensual.html');
    let html = fs.readFileSync(templatePath, 'utf8');
    // 2. Armar tabla de eventos
    let tabla_eventos = datos.eve.map((ev, idx) => `
        <tr>
            <td>${idx + 1}</td>
            <td>${ev.nom_eve}</td>
            <td>${ev.tip_eve}</td>
            <td>${ev.val_eve ?? '-'}</td>
            <td>${ev.fec_fin_eve ? new Date(ev.fec_fin_eve).toLocaleDateString() : '-'}</td>
            <td>${ev.nom_cre} ${ev.ape_cre}</td>
            <td>${ev.can_ins}</td>
            <td>${ev.tot_eve}</td>
        </tr>
    `).join("");
    // 3. Reemplaza los placeholders
    html = html
        .replace('{{anio}}', datos.anio)
        .replace('{{mes}}', datos.nombreMes)
        .replace('{{tabla_eventos}}', tabla_eventos)
        .replace('{{tot_tod_eve}}', datos.tot_tod_eve ?? 0);

    // 4. Genera el PDF con Puppeteer
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    await page.pdf({
        path: filePath,
        format: 'A4',
        printBackground: true,
        margin: { top: 20, bottom: 20, left: 20, right: 20 }
    });

    await browser.close();
}

module.exports = { generarReporteEventoPDF, generarReporteMensualPDF };
