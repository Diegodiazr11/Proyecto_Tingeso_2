import jsPDF from 'jspdf';

const ReservationVoucher = (reservation) => {
    const doc = new jsPDF();
    const pkg = reservation.travelPackage;
    const client = reservation.client;

    const formatDate = (dateStr) =>
        new Date(dateStr).toLocaleDateString('es-CL', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });


    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('COMPROBANTE DE RESERVA', 105, 18, { align: 'center' });


    doc.setFillColor(243, 244, 246);
    doc.rect(0, 30, 210, 12, 'F');
    doc.setTextColor(75, 85, 99);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`N° Reserva: #${reservation.id}`, 14, 38);
    doc.text(`Fecha de emisión: ${formatDate(new Date())}`, 140, 38);


    let y = 55;
    doc.setTextColor(30, 64, 175);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DATOS DEL CLIENTE', 14, y);

    doc.setDrawColor(30, 64, 175);
    doc.line(14, y + 2, 196, y + 2);

    y += 10;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nombre:`, 14, y);
    doc.setFont('helvetica', 'bold');
    doc.text(`${client?.firstName} ${client?.lastName}`, 50, y);

    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(`Email:`, 14, y);
    doc.setFont('helvetica', 'bold');
    doc.text(`${client?.email}`, 50, y);

    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(`Documento:`, 14, y);
    doc.setFont('helvetica', 'bold');
    doc.text(`${client?.document ?? '—'}`, 50, y);

    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(`Teléfono:`, 14, y);
    doc.setFont('helvetica', 'bold');
    doc.text(`${client?.phone ?? '—'}`, 50, y);

    y += 16;
    doc.setTextColor(30, 64, 175);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DATOS DEL PAQUETE', 14, y);
    doc.line(14, y + 2, 196, y + 2);

    y += 10;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Paquete:`, 14, y);
    doc.setFont('helvetica', 'bold');
    doc.text(`${pkg?.namePackage}`, 50, y);

    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(`Destino:`, 14, y);
    doc.setFont('helvetica', 'bold');
    doc.text(`${pkg?.destinationPackage}`, 50, y);

    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha inicio:`, 14, y);
    doc.setFont('helvetica', 'bold');
    doc.text(`${formatDate(pkg?.startDate)}`, 50, y);

    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha fin:`, 14, y);
    doc.setFont('helvetica', 'bold');
    doc.text(`${formatDate(pkg?.endDate)}`, 50, y);

    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(`Servicios:`, 14, y);
    doc.setFont('helvetica', 'bold');
    const services = doc.splitTextToSize(`${pkg?.servicePackage}`, 140);
    doc.text(services, 50, y);
    y += (services.length - 1) * 6;

    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(`Condiciones:`, 14, y);
    doc.setFont('helvetica', 'bold');
    const condition = doc.splitTextToSize(`${pkg?.conditionPackage}`, 140);
    doc.text(condition, 50, y);
    y += (condition.length - 1) * 6;

    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(`Clasificación:`, 14, y);
    doc.setFont('helvetica', 'bold');
    const classification = doc.splitTextToSize(`${pkg?.classificationPackage}`, 140);
    doc.text(classification, 50, y);
    y += (classification.length - 1) * 6;

    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(`Restricciones:`, 14, y);
    doc.setFont('helvetica', 'bold');
    const restriction = doc.splitTextToSize(`${pkg?.restrictionPackage}`, 140);
    doc.text(restriction, 50, y);
    y += (restriction.length - 1) * 6;

    y += 16;
    doc.setTextColor(30, 64, 175);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DATOS DE LA RESERVA', 14, y);
    doc.line(14, y + 2, 196, y + 2);

    y += 10;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Pasajeros:`, 14, y);
    doc.setFont('helvetica', 'bold');
    doc.text(`${reservation.passengerCount}`, 50, y);

    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(`Precio base:`, 14, y);
    doc.setFont('helvetica', 'bold');
    doc.text(`$${reservation.basePrice.toLocaleString('en-US')}`, 50, y);

    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(`Descuento:`, 14, y);
    doc.setFont('helvetica', 'bold');
    doc.text(`$${reservation.discountAmount.toLocaleString('en-US')}`, 50, y);

    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(`Total:`, 14, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.text(`$${reservation.totalPrice.toLocaleString('en-US')}`, 50, y);

    y += 8;
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text(`Estado:`, 14, y);
    doc.setFont('helvetica', 'bold');
    doc.text("Confirmada", 50, y);

    doc.setFillColor(30, 64, 175);
    doc.rect(0, 275, 210, 22, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Este documento es un comprobante oficial de su reserva.', 105, 283, { align: 'center' });
    doc.text('Gracias por elegir nuestra agencia de viajes.', 105, 290, { align: 'center' });

    doc.save(`comprobante-reserva-${reservation.id}.pdf`);
};

export default ReservationVoucher;