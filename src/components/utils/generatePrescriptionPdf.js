import { jsPDF } from 'jspdf';
import domtoimage from 'dom-to-image-more';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';

export const generatePrescriptionPdf = async (elementId, patientName) => {
    const element = document.getElementById(elementId);

    if (!element) {
        console.error("Prescription element not found!");
        return;
    }

    try {
        // We MUST use dom-to-image-more because html2canvas fatally crashes on Tailwind oklch colors.
        // We explicitly pass width and height to force the SVG layer to lock layout preventing flex compression!
        const imgData = await domtoimage.toJpeg(element, {
            quality: 1.0,
            bgcolor: '#ffffff',
            width: 794,
            height: element.scrollHeight,
            style: {
                transform: 'scale(1)',
                transformOrigin: 'top left',
                width: '794px'
            }
        });

        // Initialize jsPDF (Portrait, millimeters, A4 size)
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
        const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

        const elementWidth = 794;
        const elementHeight = element.scrollHeight;

        // Calculate the total height of the image when scaled to A4 width
        const totalImgHeightInMm = (elementHeight * pdfWidth) / elementWidth;

        let heightLeft = totalImgHeightInMm;
        let position = 0;

        // Add the first page
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, totalImgHeightInMm);
        heightLeft -= pdfHeight;

        // ✅ FIX: Use `> 1` instead of `> 0` to absorb tiny decimal remainders
        // and prevent the generation of a trailing blank page.
        while (heightLeft > 1) {
            position = heightLeft - totalImgHeightInMm;
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, totalImgHeightInMm);
            heightLeft -= pdfHeight;
        }

        // Generate filename
        const safeName = patientName ? patientName.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'patient';
        const dateStr = dayjs().format('YYYY-MM-DD');

        // Download the PDF
        pdf.save(`Prescription_${safeName}_${dateStr}.pdf`);

    } catch (error) {
        console.error("Error generating PDF: ", error);
        Swal.fire({
            icon: 'error',
            title: 'PDF Generation Failed',
            text: "Failed to generate PDF. " + (error.message || error),
            timer: 15000,
            timerProgressBar: true
        });
    }
};
