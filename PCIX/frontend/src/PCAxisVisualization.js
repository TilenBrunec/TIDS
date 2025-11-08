import React, { useState } from "react";
import axios from "axios";
import index from "./index.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
  Download,
  RefreshCw,
  BarChart3,
  Info,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function PCAxisVisualization() {
  const [pcAxisData, setPcAxisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState("bar");

  // Funkcija za pridobivanje PC-AXIS podatkov
  const fetchPCAxisData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("🔄 Pridobivam PC-AXIS podatke...");

      const response = await axios.get(
        "http://localhost:5000/api/fetch-pcaxis"
      );

      if (response.data.success) {
        console.log("✅ Podatki uspešno pridobljeni:", response.data);
        setPcAxisData(response.data);
      } else {
        throw new Error(
          response.data.error || "Napaka pri pridobivanju podatkov"
        );
      }
    } catch (err) {
      console.error("❌ Napaka:", err);
      setError(
        err.response?.data?.details ||
          err.message ||
          "Napaka pri povezavi z backend serverjem"
      );
    } finally {
      setLoading(false);
    }
  };

  // Priprava podatkov za graf
  const getChartData = () => {
    if (!pcAxisData || !pcAxisData.values || pcAxisData.values.length === 0) {
      return null;
    }

    const values = pcAxisData.values;

    // Razdelimo podatke v skupine (odvisno od strukture PC-AXIS datoteke)
    const chunkSize = Math.ceil(values.length / 6); // 6 starostnih skupin
    const dataGroups = [];

    for (let i = 0; i < values.length; i += chunkSize) {
      dataGroups.push(values.slice(i, i + chunkSize));
    }

    const labels = [
      "16-24 let",
      "25-34 let",
      "35-44 let",
      "45-54 let",
      "55-64 let",
      "65+ let",
    ];

    if (chartType === "line") {
      return {
        labels: labels.slice(0, dataGroups.length),
        datasets: [
          {
            label: "Delež oseb (%)",
            data: dataGroups.map((group) => group[0] || 0),
            borderColor: "rgb(75, 192, 192)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            tension: 0.4,
            fill: true,
          },
        ],
      };
    }

    if (chartType === "doughnut") {
      const topValues = values.slice(0, 6);
      return {
        labels: labels.slice(0, topValues.length),
        datasets: [
          {
            data: topValues,
            backgroundColor: [
              "rgba(255, 99, 132, 0.8)",
              "rgba(54, 162, 235, 0.8)",
              "rgba(255, 206, 86, 0.8)",
              "rgba(75, 192, 192, 0.8)",
              "rgba(153, 102, 255, 0.8)",
              "rgba(255, 159, 64, 0.8)",
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(153, 102, 255, 1)",
              "rgba(255, 159, 64, 1)",
            ],
            borderWidth: 2,
          },
        ],
      };
    }

    // Bar chart - privzeto
    return {
      labels: labels.slice(0, dataGroups.length),
      datasets: [
        {
          label: "Skupina 1",
          data: dataGroups.map((group) => group[0] || 0),
          backgroundColor: "rgba(54, 162, 235, 0.7)",
          borderColor: "rgb(54, 162, 235)",
          borderWidth: 2,
        },
        {
          label: "Skupina 2",
          data: dataGroups.map((group) => group[1] || 0),
          backgroundColor: "rgba(255, 99, 132, 0.7)",
          borderColor: "rgb(255, 99, 132)",
          borderWidth: 2,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: { size: 14 },
          padding: 15,
        },
      },
      title: {
        display: true,
        text: pcAxisData?.metadata?.title || "PC-AXIS podatki",
        font: { size: 18, weight: "bold" },
        padding: 20,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const unit = pcAxisData?.metadata?.units || "";
            return `${context.dataset.label}: ${context.parsed.y}${unit}`;
          },
        },
      },
    },
    scales:
      chartType !== "doughnut"
        ? {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function (value) {
                  const unit = pcAxisData?.metadata?.units || "";
                  return value + unit;
                },
              },
              title: {
                display: true,
                text: "Vrednost",
                font: { size: 14 },
              },
            },
          }
        : {},
  };

  const chartData = getChartData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                📊 PC-AXIS Vizualizacija
              </h1>
              <p className="text-gray-600">
                Podatki iz slovenskih odprtih podatkov (OPSI)
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-green-100 px-4 py-2 rounded-lg">
                <span className="text-green-800 font-semibold">
                  Format: PC-AXIS
                </span>
              </div>
              <div className="bg-blue-100 px-4 py-2 rounded-lg">
                <span className="text-blue-800 font-semibold">.PX</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gumb za pridobivanje podatkov */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Download className="text-indigo-600" size={32} />
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  Pridobi PC-AXIS datoteko
                </h3>
                <p className="text-sm text-gray-600">
                  Klikni za prenos in prikaz podatkov iz SURS
                </p>
              </div>
            </div>

            <button
              onClick={fetchPCAxisData}
              disabled={loading}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white
                transition-all duration-200 transform hover:scale-105
                ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg"
                }
              `}
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin" size={20} />
                  Nalagam podatke...
                </>
              ) : (
                <>
                  <Download size={20} />
                  Pridobi podatke
                </>
              )}
            </button>
          </div>

          {/* Podatki o datoteki */}
          {pcAxisData && (
            <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-500 rounded">
              <div className="flex items-start gap-2">
                <CheckCircle className="text-green-600 mt-1" size={20} />
                <div className="flex-1">
                  <p className="font-semibold text-green-800">
                    Podatki uspešno pridobljeni!
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Datoteka:{" "}
                    <a
                      href={pcAxisData.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-green-900"
                    >
                      0888501S.PX
                    </a>
                  </p>
                  <p className="text-sm text-green-700">
                    Vrednosti: {pcAxisData.values?.length || 0} | Pridobljeno:{" "}
                    {new Date(pcAxisData.parsedAt).toLocaleString("sl-SI")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Napaka */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded">
              <div className="flex items-start gap-2">
                <AlertCircle className="text-red-600 mt-1" size={20} />
                <div>
                  <p className="font-semibold text-red-800">
                    Napaka pri pridobivanju podatkov
                  </p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                  <p className="text-xs text-red-600 mt-2">
                    Preveri, če backend server teče na http://localhost:5000
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Kontrole za graf */}
        {pcAxisData && chartData && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <BarChart3 className="text-indigo-600" size={24} />
                <span className="font-semibold text-gray-700">Tip grafa:</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setChartType("bar")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    chartType === "bar"
                      ? "bg-indigo-600 text-white shadow-md"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  📊 Stolpčni
                </button>
                <button
                  onClick={() => setChartType("line")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    chartType === "line"
                      ? "bg-indigo-600 text-white shadow-md"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  📈 Linijski
                </button>
                <button
                  onClick={() => setChartType("doughnut")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    chartType === "doughnut"
                      ? "bg-indigo-600 text-white shadow-md"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  🍩 Tortni
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Graf */}
        {pcAxisData && chartData && (
          <div className="bg-white rounded-xl shadow-xl p-8 mb-6">
            <div style={{ height: "500px" }}>
              {chartType === "bar" && (
                <Bar data={chartData} options={chartOptions} />
              )}
              {chartType === "line" && (
                <Line data={chartData} options={chartOptions} />
              )}
              {chartType === "doughnut" && (
                <div
                  style={{
                    height: "450px",
                    maxWidth: "500px",
                    margin: "0 auto",
                  }}
                >
                  <Doughnut data={chartData} options={chartOptions} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Metadata */}
        {pcAxisData && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="text-indigo-600" size={24} />
              <h3 className="text-xl font-bold text-gray-800">
                Informacije o podatkih
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Naslov</p>
                  <p className="font-semibold text-gray-800">
                    {pcAxisData.metadata.title}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Vir</p>
                  <p className="font-semibold text-gray-800">
                    {pcAxisData.metadata.source}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Enote</p>
                  <p className="font-semibold text-gray-800">
                    {pcAxisData.metadata.units}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Posodobljeno</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(pcAxisData.metadata.updated).toLocaleDateString(
                      "sl-SI"
                    )}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Format</p>
                  <p className="font-semibold text-gray-800">PC-AXIS (.PX)</p>
                </div>

                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Število vrednosti</p>
                  <p className="font-semibold text-gray-800">
                    {pcAxisData.values.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Raw metadata (opcijsko) */}
            <details className="mt-4">
              <summary className="cursor-pointer text-indigo-600 font-semibold hover:text-indigo-800">
                Prikaži surove metapodatke
              </summary>
              <pre className="mt-2 p-4 bg-gray-900 text-green-400 rounded text-xs overflow-x-auto">
                {JSON.stringify(pcAxisData.rawMetadata, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {/* Navodila, če ni podatkov */}
        {!pcAxisData && !loading && !error && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Download className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Dobrodošli v PC-AXIS Vizualizaciji
            </h3>
            <p className="text-gray-600 mb-6">
              Kliknite gumb "Pridobi podatke" za prikaz podatkov iz slovenske
              PC-AXIS datoteke
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 text-left max-w-2xl mx-auto">
              <p className="font-semibold text-blue-800 mb-2">ℹ️ O projektu:</p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>
                  • Podatki se pridobijo iz SURS (Statistični urad Republike
                  Slovenije)
                </li>
                <li>
                  • Format: PC-AXIS (.PX) - standardni format za statistične
                  podatke
                </li>
                <li>• Podatki se obdelajo in prikažejo v grafični obliki</li>
                <li>
                  • Podpora za več tipov grafov (stolpčni, linijski, tortni)
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 text-center text-gray-600 text-sm">
          <p>
            Podatki: <strong>OPSI - Odprti podatki Slovenije</strong>
          </p>
          <p className="mt-1">Statistični urad Republike Slovenije (SURS)</p>
        </div>
      </div>
    </div>
  );
}

export default PCAxisVisualization;
