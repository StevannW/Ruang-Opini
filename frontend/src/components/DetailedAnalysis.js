import React, { useState } from 'react';

function DetailedAnalysis({ data, darkMode }) {
  const [expandedSections, setExpandedSections] = useState({
    scores: true,
    reasoning: false,
    findings: false,
    context: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Safety checks for data structure
  if (!data || !data.final_scores || !data.scores) {
    return null;
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getScoreColorText = (score) => {
    if (score >= 80) return darkMode ? 'text-green-400' : 'text-green-600';
    if (score >= 60) return darkMode ? 'text-yellow-400' : 'text-yellow-600';
    if (score >= 40) return darkMode ? 'text-orange-400' : 'text-orange-600';
    return darkMode ? 'text-red-400' : 'text-red-600';
  };

  const criteriaIcons = {
    keterkaitan_fakta: '📊',
    kejujuran_intelektual: '🎯',
    mendorong_berpikir_kritis: '💡',
    kesadaran_kekuasaan: '👁️',
    kreativitas: '🎨',
    informasi_salah: '❌',
    kebencian_perpecahan: '💢',
    penghinaan_pribadi: '🔥',
    hasutan_bahaya: '⚠️'
  };

  const criteriaNames = {
    keterkaitan_fakta: 'Dasar Faktual',
    kejujuran_intelektual: 'Nada & Respek',
    mendorong_berpikir_kritis: 'Berorientasi Solusi',
    kesadaran_kekuasaan: 'Fokus pada Isu',
    kreativitas: 'Niat Sarkasme',
    informasi_salah: 'Misinformasi',
    kebencian_perpecahan: 'Ujaran Kebencian',
    penghinaan_pribadi: 'Serangan Personal',
    hasutan_bahaya: 'Bahasa Provokatif'
  };

  return (
    <div className={`rounded-2xl shadow-2xl overflow-hidden transition-all-smooth ${
      darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">📊 Analisis Konten Politik Indonesia</h2>
        <p className="text-sm opacity-90">Sistem Penilaian Kritik Konstruktif vs Destruktif</p>
        <p className="text-xs opacity-75 mt-2">Dianalisis: {new Date().toLocaleDateString('id-ID')}</p>
      </div>

      {/* Detailed Scores */}
      <div className={`p-6 border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <button
          onClick={() => toggleSection('scores')}
          className={`w-full flex items-center justify-between mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}
        >
          <h3 className="text-lg font-bold flex items-center gap-2">
            {criteriaIcons.keterkaitan_fakta} Skor Detail (9 Kriteria)
          </h3>
          <span className="text-2xl">{expandedSections.scores ? '▼' : '▶'}</span>
        </button>

        {expandedSections.scores && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-in-up">
            {Object.entries(data.scores).map(([key, value]) => (
              <div
                key={key}
                className={`rounded-xl p-4 transition-all-smooth hover-lift ${
                  darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{criteriaIcons[key]}</span>
                    <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {criteriaNames[key]}
                    </span>
                  </div>
                  <span className={`text-2xl font-bold ${getScoreColorText(value)}`}>
                    {value}
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className={`w-full h-2 rounded-full overflow-hidden ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <div
                    className={`h-full transition-all duration-1000 ${getScoreColor(value)}`}
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Red Flags */}
      {data.red_flags && data.red_flags.length > 0 && (
        <div className={`p-6 border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className={`rounded-xl p-4 border-2 border-l-4 ${
            darkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-300'
          }`}>
            <h4 className={`font-bold mb-2 ${darkMode ? 'text-red-400' : 'text-red-700'}`}>
              🚨 Red Flag Ditemukan
            </h4>
            <ul className={`list-disc list-inside text-sm ${darkMode ? 'text-red-300' : 'text-red-600'}`}>
              {data.red_flags.map((flag, index) => (
                <li key={index}>{flag}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Key Findings */}
      {data.key_findings && data.key_findings.length > 0 && (
        <div className={`p-6 border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <button
            onClick={() => toggleSection('findings')}
            className={`w-full flex items-center justify-between mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}
          >
            <h3 className="text-lg font-bold flex items-center gap-2">
              💎 Temuan Utama
            </h3>
            <span className="text-2xl">{expandedSections.findings ? '▼' : '▶'}</span>
          </button>

          {expandedSections.findings && (
            <div className="space-y-3 animate-slide-in-up">
              {data.key_findings.map((finding, index) => (
                <div
                  key={index}
                  className={`rounded-lg p-4 border-l-4 ${
                    darkMode ? 'bg-gray-800 border-cyan-500' : 'bg-cyan-50 border-cyan-400'
                  }`}
                >
                  <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    {finding}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Context References */}
      {data.context_references && data.context_references.length > 0 && (
        <div className={`p-6 border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <button
            onClick={() => toggleSection('context')}
            className={`w-full flex items-center justify-between mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}
          >
            <h3 className="text-lg font-bold flex items-center gap-2">
              🔗 Referensi Konteks
            </h3>
            <span className="text-2xl">{expandedSections.context ? '▼' : '▶'}</span>
          </button>

          {expandedSections.context && (
            <div className="space-y-3 animate-slide-in-up">
              {data.context_references.map((reference, index) => (
                <div
                  key={index}
                  className={`rounded-lg p-4 border-l-4 ${
                    darkMode ? 'bg-gray-800 border-blue-500' : 'bg-blue-50 border-blue-400'
                  }`}
                >
                  <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    {reference}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reasoning */}
      {data.reasoning && Object.keys(data.reasoning).length > 0 && (
        <div className={`p-6 border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <button
            onClick={() => toggleSection('reasoning')}
            className={`w-full flex items-center justify-between mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}
          >
            <h3 className="text-lg font-bold flex items-center gap-2">
              📝 Penjelasan Kriteria
            </h3>
            <span className="text-2xl">{expandedSections.reasoning ? '▼' : '▶'}</span>
          </button>

          {expandedSections.reasoning && (
            <div className="space-y-4 animate-slide-in-up">
              {Object.entries(data.reasoning).map(([key, value]) => (
                <div
                  key={key}
                  className={`rounded-lg overflow-hidden ${
                    darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className={`px-4 py-3 font-medium flex items-center gap-2 ${
                    darkMode ? 'bg-gray-750 text-gray-200' : 'bg-gray-100 text-gray-800'
                  }`}>
                    <span>{criteriaIcons[key]}</span>
                    <span>{criteriaNames[key]}</span>
                  </div>
                  <div className={`px-4 py-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Overall Impression */}
      {data.overall_impression && (
        <div className={`p-6 ${darkMode ? 'bg-gray-850' : 'bg-gray-50'}`}>
          <h3 className={`text-lg font-bold mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            🎯 Kesimpulan Keseluruhan
          </h3>
          <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {data.overall_impression}
          </p>
        </div>
      )}
    </div>
  );
}

export default DetailedAnalysis;
