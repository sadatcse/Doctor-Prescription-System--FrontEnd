import React, { useState } from 'react';
import { HiCheckCircle } from 'react-icons/hi2';
// Import your different layout components here
import PrescriptionPreview from '../../components/Prescription/PrescriptionPreview'; 
// import PrescriptionPreviewModern from '../../components/Prescription/PrescriptionPreviewModern';
// import PrescriptionPreviewMinimal from '../../components/Prescription/PrescriptionPreviewMinimal';

export default function PrescriptionTemplate() {
    // 1. Manage which template is currently selected
    const [activeTemplate, setActiveTemplate] = useState('classic');

    // 2. Realistic Dummy Data to make the previews look good
    const dummyData = {
        patient: { name: 'John Doe', age: '32', gender: 'Male' },
        vitals: { bp: '120/80', weight: '70 kg', temp: '98.6 °F' },
        complaints: ['Fever for 3 days', 'Severe headache', 'Body ache'],
        history: ['No known allergies', 'Asthma'],
        examination: ['Pulse: 90bpm'],
        diagnosis: ['Viral Fever', 'Suspected Dengue'],
        investigations: ['CBC', 'Dengue NS1 Antigen'],
        medicines: [
            { name: 'Napa Extend 665mg', type: 'Tab', dosage: '1+1+1', duration: '5 days', instruction: 'After meal' },
            { name: 'Fexo 120mg', type: 'Tab', dosage: '0+0+1', duration: '7 days', instruction: 'Before sleep' }
        ],
        advice: ['Drink plenty of water', 'Take complete rest'],
        followUp: '5 days'
    };

    const dummyDoctor = {
        fullName: "Dr. Sarah Smith",
        degrees: "MBBS, FCPS (Medicine)",
        specialty: "Medicine Specialist",
        bmdc: "A-12345"
    };

    const dummyChamber = {
        chamberName: "City Care Diagnostic Center",
        address: "123 Health Avenue, Medical District, Dhaka",
        phone: "+880 1234 567890"
    };

    // 3. Array of your templates
    const templates = [
        {
            id: 'classic',
            name: 'Classic Layout',
            description: 'Standard two-column layout. Ideal for general physicians.',
            component: PrescriptionPreview
        },
        // {
        //     id: 'modern',
        //     name: 'Modern Layout',
        //     description: 'Clean single-column flow with highlighted headers.',
        //     component: PrescriptionPreviewModern
        // },
        // {
        //     id: 'minimal',
        //     name: 'Minimal Layout',
        //     description: 'Saves ink. Best for quick consults.',
        //     component: PrescriptionPreviewMinimal
        // }
    ];

    return (
        <div className="p-4 md:p-6 bg-slate-50 dark:bg-gray-900 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-gray-100">Prescription Templates</h1>
                        <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">Select the default layout style for your printed prescriptions.</p>
                    </div>
                </div>

                {/* Templates Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((template) => {
                        const isSelected = activeTemplate === template.id;
                        const TemplateComponent = template.component;

                        return (
                            <div 
                                key={template.id}
                                onClick={() => setActiveTemplate(template.id)}
                                className={`relative flex flex-col bg-white dark:bg-gray-800 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 border-2 ${
                                    isSelected 
                                    ? 'border-cyan-500 shadow-md ring-4 ring-cyan-500/10' 
                                    : 'border-slate-200 dark:border-gray-700 hover:border-cyan-300 hover:shadow-md'
                                }`}
                            >
                                {/* Selection Badge */}
                                {isSelected && (
                                    <div className="absolute top-4 right-4 z-20 bg-cyan-500 text-white p-1 rounded-full shadow-sm">
                                        <HiCheckCircle size={24} />
                                    </div>
                                )}

                                {/* Thumbnail Container (A4 Aspect Ratio approx 1:1.414) */}
                                <div className="w-full aspect-[1/1.2] bg-slate-100 dark:bg-gray-900 relative overflow-hidden flex items-center justify-center border-b border-slate-200 dark:border-gray-700">
                                    
                                    {/* CSS Scaling Magic: Renders the full A4 component but shrinks it to 30% size */}
                                    <div className="absolute top-0 transform scale-[0.35] origin-top pointer-events-none w-[210mm]">
                                        <TemplateComponent 
                                            data={dummyData} 
                                            language="EN" 
                                            doctor={dummyDoctor}
                                            chamber={dummyChamber}
                                        />
                                    </div>
                                    
                                    {/* Glass Overlay to prevent accidental clicks inside the iframe/preview */}
                                    <div className="absolute inset-0 bg-transparent z-10"></div>
                                </div>

                                {/* Template Info */}
                                <div className="p-5">
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-gray-100">
                                        {template.name}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
                                        {template.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </div>
    );
}