import React from 'react';
import dayjs from 'dayjs';
import Barcode from 'react-barcode';

export default function PrescriptionPreview({ data, language, doctor, chamber }) {
  const today = dayjs().format('MMM D, YYYY');

  let calculatedNextVisit = '';
  if (data.followUp) {
    const amount = parseInt(data.followUp, 10);
    const unit = data.followUpUnit === 'months' ? 'month' : 'day';
    if (!isNaN(amount)) {
      calculatedNextVisit = dayjs().add(amount, unit).format('DD MMMM YYYY');
    }
  }

  const dict = {
    EN: {
      name: 'Name', age: 'Age', gender: 'Gender', date: 'Date',
      vitals: 'Vitals', complaints: 'Chief Complaints', history: 'History',
      examination: 'On Examination', diagnosis: 'Diagnosis', investigations: 'Investigations',
      advice: 'Advice', followUp: 'Follow Up', reviewAfter: 'Review after',
      nextVisit: 'Next Visit', signature: 'Signature',
      placeholderRx: 'Add medicines from the right panel',
      placeholderInfo: 'Vital signs, chief complaint, history, examination, diagnosis & investigations will appear here',
      days: 'Days', months: 'Months'
    },
    BN: {
      name: 'নাম', age: 'বয়স', gender: 'লিঙ্গ', date: 'তারিখ',
      vitals: 'শারীরিক লক্ষণ', complaints: 'প্রধান সমস্যা', history: 'পূর্বের ইতিহাস',
      examination: 'শারীরিক পরীক্ষা', diagnosis: 'রোগ নির্ণয়', investigations: 'পরীক্ষা-নিরীক্ষা',
      advice: 'পরামর্শ', followUp: 'ফলোআপ', reviewAfter: 'সাক্ষাৎ',
      nextVisit: 'পরবর্তী সাক্ষাৎ', signature: 'স্বাক্ষর',
      placeholderRx: 'ডান দিকের প্যানেল থেকে ওষুধ যোগ করুন',
      placeholderInfo: 'শারীরিক লক্ষণ, প্রধান সমস্যা, ইতিহাস, পরীক্ষা ও রোগ নির্ণয় এখানে প্রদর্শিত হবে',
      days: 'দিন', months: 'মাস'
    }
  };
  const t = dict[language] || dict.EN;

  const formatSchedule = (scheduleArray) => {
    if (!scheduleArray || scheduleArray.length === 0) return 'By Appointment';
    const activeDays = scheduleArray.filter(day => !day.isHoliday);
    if (activeDays.length === 0) return 'Currently Unavailable';

    const orderedDays = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const timeGroups = {};

    activeDays.forEach(day => {
      const timeStr = `${day.startTime || ''} - ${day.endTime || ''}`;
      if (!timeGroups[timeStr]) timeGroups[timeStr] = [];
      const shortDay = day.day.substring(0, 3);
      if (!timeGroups[timeStr].includes(shortDay)) {
        timeGroups[timeStr].push(shortDay);
      }
    });

    const groupDays = (daysArray) => {
      const sorted = [...daysArray].sort((a, b) => orderedDays.indexOf(a) - orderedDays.indexOf(b));
      const ranges = [];
      let start = sorted[0];
      let prevIdx = orderedDays.indexOf(sorted[0]);

      for (let i = 1; i <= sorted.length; i++) {
        const curr = sorted[i];
        const currIdx = orderedDays.indexOf(curr);

        if (i === sorted.length || currIdx !== prevIdx + 1) {
          const end = sorted[i - 1];
          if (start === end) {
            ranges.push(start);
          } else if (orderedDays.indexOf(end) - orderedDays.indexOf(start) === 1) {
            ranges.push(`${start}, ${end}`);
          } else {
            ranges.push(`${start}-${end}`);
          }
          if (i < sorted.length) {
            start = curr;
            prevIdx = currIdx;
          }
        } else {
          prevIdx = currIdx;
        }
      }
      return ranges.join(', ');
    };

    const groups = Object.entries(timeGroups).map(([time, days]) => `${groupDays(days)} (${time})`);

    return groups.map((group, index) => (
      <React.Fragment key={index}>
        {index > 0 && <br />}
        {group}
      </React.Fragment>
    ));
  };

  return (
    <div className="bg-slate-100 dark:bg-gray-900 flex-1 overflow-y-auto overflow-x-auto p-4 md:p-8 flex justify-center print:p-0 print:bg-white transition-colors duration-300 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] print:overflow-visible print:h-auto">

      {/* ✨ NEW: CSS Print Rules to override parent app constraints and enable proper pagination ✨ */}
      <style>
        {`
          @media print {
            body, html, #root, .min-h-screen, .h-screen {
              height: auto !important;
              min-height: 0 !important;
              overflow: visible !important;
            }
            /* Ensures flex layouts don't violently collapse during page breaks */
            .flex-1 {
              height: auto !important;
            }
            @page {
              margin: 10mm;
            }
          }
        `}
      </style>

      {/* Changed print:h-full to print:h-auto so it can expand to multiple pages natively */}
      <div id="prescription-preview" className="bg-white shrink-0 w-[794px] min-w-[794px] max-w-none min-h-[1123px] shadow-lg p-10 flex flex-col relative print:shadow-none print:w-full print:min-w-0 print:h-auto print:min-h-0 text-slate-900 mx-auto">

        {/* Header / Logo Area */}
        <div id="prescription-header" className="flex justify-between items-start mb-6 pb-6 border-b-2 border-slate-800 break-inside-avoid">
          <div className="flex items-start max-w-[60%]">
            <div className="text-left">
              <h2 className="text-2xl font-bold uppercase text-slate-800 m-0 mb-1">
                {doctor?.name || 'Doctor Name'}
              </h2>
              <p className="text-sm text-slate-700 m-0 mb-1">
                {doctor?.degree || 'Qualifications'}
              </p>
              <p className="text-sm font-bold text-cyan-700 m-0 mb-1">
                {doctor?.designation || 'Designation'} {doctor?.institution ? ` • ${doctor.institution}` : ''}
              </p>
              <p className="text-sm text-slate-700 m-0">
                <strong>BMDC Reg. No:</strong> {doctor?.bmdcRegistrationNumber || 'N/A'}
              </p>
            </div>
          </div>
          <div className="text-right max-w-[40%] flex flex-col items-end">
            <div>
              <h3 className="text-lg font-bold text-slate-800 m-0 mb-1">
                {chamber?.chamberName || 'Chamber Name'}
              </h3>
              <p className="text-sm text-slate-700 m-0 mb-1 whitespace-pre-line">
                {chamber?.address || 'Chamber Address'}
              </p>
              <p className="text-sm text-slate-700 m-0 mb-1">
                <strong>Phone:</strong> {chamber?.mobileNumber || 'N/A'}
              </p>
              <p className="text-sm text-slate-700 m-0">
                <strong>Visiting Hours:</strong> {formatSchedule(chamber?.schedule)}
              </p>
            </div>


          </div>
        </div>

        {/* Patient Info Bar */}
        <div className="border-b-2 border-slate-800 pb-3 mb-6 break-inside-avoid">
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2 text-sm font-bold text-slate-900">
            <div className="flex gap-1 items-baseline flex-1 min-w-[150px]">
              {t.name}: <span className="font-normal ml-1 border-b border-dotted border-slate-400 grow min-w-[50px]">{data.patient.name}</span>
            </div>
            <div className="flex gap-1 items-baseline whitespace-nowrap">
              {t.age}: <span className="font-normal ml-1 border-b border-dotted border-slate-400 min-w-[30px] text-center">{data.patient.age}</span>
            </div>
            <div className="flex gap-1 items-baseline whitespace-nowrap">
              {t.gender}: <span className="font-normal ml-1 border-b border-dotted border-slate-400 min-w-[40px] text-center">{data.patient.gender}</span>
            </div>
            <div className="flex gap-1 items-baseline whitespace-nowrap justify-end">
              {t.date}: <span className="font-normal ml-1 text-slate-600">{today}</span>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex gap-8 print:h-auto print:overflow-visible">
          {/* Left Column */}
          <div className="w-1/3 border-r border-slate-200 pr-6 flex flex-col gap-6">

            {/* ✨ ADDED 'break-inside-avoid' to all sections to prevent bad page splits ✨ */}
            {(data.vitals.bp || data.vitals.weight || data.vitals.pulse || data.vitals.temp) && (
              <div className="text-sm break-inside-avoid">
                <h4 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-wider">{t.vitals}</h4>
                <div className="space-y-1 text-slate-700">
                  {data.vitals.bp && <div>BP: {data.vitals.bp} mmHg</div>}
                  {data.vitals.pulse && <div>Pulse: {data.vitals.pulse} bpm</div>}
                  {data.vitals.temp && <div>Temp: {data.vitals.temp} °F</div>}
                  {data.vitals.weight && <div>Weight: {data.vitals.weight} kg</div>}
                  {data.vitals.height && <div>Height: {data.vitals.height} cm</div>}
                  {data.vitals.bmi && <div>BMI: {data.vitals.bmi} kg/m²</div>}
                  {data.vitals.waist && <div>Waist: {data.vitals.waist} cm</div>}
                  {data.vitals.hip && <div>Hip: {data.vitals.hip} cm</div>}
                  {data.vitals.whr && <div>W/H Ratio: {data.vitals.whr}</div>}
                  {data.vitals.bodyFat && <div>Body Fat: {data.vitals.bodyFat}%</div>}
                  {data.vitals.spo2 && <div>SpO2: {data.vitals.spo2} %</div>}
                </div>
              </div>
            )}

            {data.complaints.length > 0 && (
              <div className="text-sm break-inside-avoid">
                <h4 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-wider">{t.complaints}</h4>
                <ul className="list-disc list-inside text-slate-700 space-y-0.5">
                  {data.complaints.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            )}

            {data.history.length > 0 && (
              <div className="text-sm break-inside-avoid">
                <h4 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-wider">{t.history}</h4>
                <ul className="list-disc list-inside text-slate-700 space-y-0.5">
                  {data.history.map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              </div>
            )}

            {data.examination.length > 0 && (
              <div className="text-sm break-inside-avoid">
                <h4 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-wider">{t.examination}</h4>
                <ul className="list-disc list-inside text-slate-700 space-y-0.5">
                  {data.examination.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}

            {data.diagnosis.length > 0 && (
              <div className="text-sm break-inside-avoid">
                <h4 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-wider">{t.diagnosis}</h4>
                <ul className="list-disc list-inside text-slate-700 space-y-0.5">
                  {data.diagnosis.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </div>
            )}

            {data.investigations.length > 0 && (
              <div className="text-sm break-inside-avoid">
                <h4 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-wider">{t.investigations}</h4>
                <ul className="list-disc list-inside text-slate-700 space-y-0.5">
                  {data.investigations.map((inv, i) => <li key={i}>{inv}</li>)}
                </ul>
                
                {data.investigationsDiscount && (
                  <div className="mt-3 text-xs font-bold text-slate-800 bg-slate-100 border border-slate-300 px-3 py-1.5 inline-block rounded uppercase tracking-wide">
                    Discount Requested: {data.investigationsDiscount}
                  </div>
                )}
              </div>
            )}

            {!data.vitals.bp && data.complaints.length === 0 && data.history.length === 0 && data.examination.length === 0 && data.diagnosis.length === 0 && data.investigations.length === 0 && (
              <div className="text-xs text-slate-400 italic leading-relaxed mt-10 break-inside-avoid">
                {t.placeholderInfo}
              </div>
            )}
          </div>

          {/* Right Column: Rx, Advice */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-baseline gap-2 mb-6 break-inside-avoid">
              <span className="text-4xl font-serif font-bold text-slate-900">Rx</span>
            </div>

            {data.medicines.length > 0 ? (
              <div className="space-y-6 mb-8">
                {data.medicines.map((med, index) => (
                  <div key={index} className="text-sm text-slate-800 break-inside-avoid">
                    <div className="font-bold text-base">{index + 1}. {med.name}</div>
                    <div className="text-slate-600 ml-4 mt-1">
                      {med.dosage} • {med.duration} • {med.instruction}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-400 italic mb-8 break-inside-avoid">
                {t.placeholderRx}
              </div>
            )}

            {data.advice.length > 0 && (
              <div className="mt-8 border-t border-slate-100 pt-6 break-inside-avoid">
                <h4 className="font-bold text-slate-900 mb-3 uppercase text-xs tracking-wider">{t.advice}</h4>
                <ul className="list-disc list-inside text-slate-700 space-y-1">
                  {data.advice.map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              </div>
            )}

            {data.followUp && (
              <div className="mt-6 break-inside-avoid">
                <h4 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-wider">{t.followUp}</h4>
                <p className="text-slate-700">
                  {t.reviewAfter} {data.followUp} {t[data.followUpUnit || 'days']}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {/* ✨ ADDED 'break-inside-avoid print:mt-10' to ensure signature is never split onto a new page alone ✨ */}
        <div className="mt-auto border-t border-slate-200 pt-8 flex justify-between items-end break-inside-avoid print:mt-10 relative">
          <div className="text-sm font-bold flex flex-row items-baseline gap-8 min-w-[150px]">
            {data.followUp && calculatedNextVisit ? (
              <div className="flex items-baseline gap-1 whitespace-nowrap text-slate-900 uppercase">
                {t.nextVisit}: <span className="font-normal tracking-wide">{calculatedNextVisit}</span>
              </div>
            ) : null}
          </div>

          {/* Centered Barcode */}
          {data.prescriptionId && (
            <div className="absolute left-1/2 -translate-x-1/2 bottom-0 flex flex-col items-center">
              <Barcode value={data.prescriptionId} width={1.2} height={32} fontSize={11} displayValue={true} margin={0} background="transparent" />
            </div>
          )}

          <div className="text-right flex flex-col items-end">
            {doctor?.signature ? (
              <img src={doctor.signature} alt="Signature" className="h-12 mb-1 object-contain" />
            ) : (
              <div className="w-40 border-b border-slate-400 mb-2"></div>
            )}
            <div className="text-[12px] text-slate-800 uppercase tracking-widest font-bold">{t.signature}</div>
          </div>
        </div>
      </div>
    </div>
  );
}