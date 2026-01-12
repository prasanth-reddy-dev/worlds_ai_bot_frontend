
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import jsPDF from "jspdf";
import APIService from "../../services/api";
import { BACKEND_URL } from '../../../config/constant';

const CertificateCard = ({ data, type, onDownload }) => {
  const getTitle = () => {
    switch (type) {
      case "program":
        return "Certificate of Completion";
      case "participation":
        return "Certificate of Participation";
      case "internship":
        return "Internship Certificate";
      default:
        return "Certificate";
    }
  };

  return (
    <div className="group">
      <div className="relative bg-amber-50 rounded-xl overflow-hidden shadow-xl border-2 border-amber-200 hover:shadow-2xl transition-shadow">
        {/* Gold corner accents */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-amber-400"></div>
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-amber-400"></div>
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-amber-400"></div>
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-amber-400"></div>

        <div className="m-3 border border-slate-600 rounded-lg p-5">
          {/* Logo W - rotated */}
          <div className="text-center mb-1">
            <span className="text-3xl font-bold text-slate-700 inline-block transform rotate-12">W</span>
          </div>

          <p className="text-center text-xs font-bold text-gray-600 mb-2">{data.companyName}</p>

          {/* Decorative line */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="h-px w-8 bg-amber-400"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
            <div className="h-px w-8 bg-amber-400"></div>
          </div>

          <h3 className="text-lg font-bold text-center text-slate-700 mb-2">{getTitle()}</h3>

          {/* Decorative line */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="h-px w-12 bg-amber-400"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
            <div className="h-px w-12 bg-amber-400"></div>
          </div>

          <p className="text-center text-xs italic text-gray-500 mb-1">This is to certify that</p>

          <h2 className="text-xl font-bold text-center text-slate-700 mb-1">{data.recipientName.toUpperCase()}</h2>

          <div className="w-2/3 h-px bg-slate-600 mx-auto mb-3"></div>

          <p className="text-center text-xs text-gray-600 mb-1">
            {type === "program" && "has successfully completed the course"}
            {type === "participation" && "has actively participated in"}
            {type === "internship" && "has completed the internship as"}
          </p>

          <p className="text-center text-base font-bold text-slate-700 mb-2">{data.courseName}</p>

          <p className="text-center text-xs text-gray-500 mb-3">{data.startDate} - {data.endDate}</p>

          <p className="text-center text-xs text-gray-400 mb-3">{data.credentials}</p>

          {/* Signature */}
          <div className="text-center mb-3">
            <div className="w-16 h-px bg-gray-400 mx-auto mb-1"></div>
            <p className="text-xs font-bold text-gray-700">{data.programDirector}</p>
            <p className="text-xs text-gray-500">Program Director</p>
          </div>

          <div className="h-px bg-amber-400 mb-2"></div>

          <div className="flex justify-between text-xs text-gray-500">
            <span>Issued: {data.endDate}</span>
            <span>ID: {data.certificateId}</span>
          </div>
        </div>

        {/* Download Button */}
        <div className="p-3 bg-slate-700">
          <button
            className="w-full px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-lg font-bold transition-all transform hover:scale-[1.02] active:scale-95"
            onClick={onDownload}
          >
            <i className="bi bi-download mr-2"></i>
            Download Certificate
          </button>
        </div>
      </div>
    </div>
  );
};

function Awards() {
  const { user } = useSelector((state) => state.user || {});
  const id = user?._id || "null";
  const [certificates, setCertificates] = useState({
    pCertificates: [],
    iCertificates: [],
    cCertificates: [],
  });
  const [alert, setAlert] = useState(null);
  const [progress, setProgress] = useState(100);

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setProgress(100);
  };

  const dismissAlert = () => {
    setAlert(null);
    setProgress(100);
  };

  useEffect(() => {
    if (alert) {
      const duration = 3000;
      const interval = 50;
      const decrement = (interval / duration) * 100;

      const timer = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - decrement;
          if (newProgress <= 0) {
            dismissAlert();
            clearInterval(timer);
            return 0;
          }
          return newProgress;
        });
      }, interval);

      return () => clearInterval(timer);
    }
  }, [alert]);

  const programCertificateData = {
    companyName: "WorldsAiBot",
    name: "Certified Python Developer",
    recipientName: "John Doe",
    description:
      "Awarded for successfully completing the comprehensive Python Full Stack Development Program with excellence.",
    startDate: "01-Jan-2023",
    endDate: "30-Jun-2023",
    courseName: "Python Full Stack Web Development",
    certificateId: "WAB-2023-PY-001",
    programDirector: "N.Prasanth Kumar",
    credentials:
      "This e-certificate validates the successful completion of the program, including practical projects and assessments.",
  };

  const participationCertificateData = {
    companyName: "WorldsAiBot",
    recipientName: "John Doe",
    eventName: "Course Name",
    startDate: "01-Jan-2023",
    endDate: "05-Jan-2023",
    certificateId: "WAB-2023-BT-001",
    programDirector: "N.Prasanth Kumar",
    credentials:
      "This e-certificate is awarded for active participation in the event.",
  };

  const internshipCertificateData = {
    companyName: "WorldsAiBot",
    recipientName: "John Doe",
    position: "Full Stack Developer Intern",
    startDate: "01-Jan-2023",
    endDate: "30-Jun-2023",
    certificateId: "WAB-2023-IN-001",
    programDirector: "N.Prasanth Kumar",
    credentials:
      "This e-certificate is awarded for successfully completing the internship program.",
  };

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        showAlert("Fetching your certificates...", "info");
        // Use APIService which has auth headers configured
        const response = await APIService.users.getById(id);
        // Extract certificate arrays from user object
        setCertificates({
          pCertificates: response.data.pCertificates || [],
          iCertificates: response.data.iCertificates || [],
          cCertificates: response.data.cCertificates || [],
        });
        showAlert("Certificates loaded successfully!", "success");
      } catch (error) {
        showAlert(`Error fetching certificates: ${error.message}`, "error");
      }
    };

    if (id !== "null") {
      fetchCertificates();
    } else {
      showAlert("No user ID found. Showing sample certificates.", "info");
    }
  }, [id]);

  useEffect(() => {
    if (
      certificates.pCertificates.length === 0 &&
      certificates.iCertificates.length === 0 &&
      certificates.cCertificates.length === 0 &&
      id !== "null"
    ) {
      showAlert("No certificates found. Showing sample certificates.", "info");
    }
  }, [certificates, id]);

  const generateCertificate = (certificate, type) => {
    const certData = {
      companyName: certificate.companyName || "WorldsAiBot",
      recipientName: certificate.recipientName || "Recipient Name",
      courseName: certificate.courseName || "Course Name",
      startDate: certificate.startDate || "Start Date",
      endDate: certificate.endDate || "End Date",
      certificateId: certificate.certificateId || "CERT-001",
      programDirector: certificate.programDirector || "N.Prasanth Kumar",
      credentials: certificate.credentials || "This certificate validates the successful completion of the program.",
    };

    const doc = new jsPDF("p", "mm", "a4");
    const w = doc.internal.pageSize.width;
    const h = doc.internal.pageSize.height;
    const cx = w / 2;

    // Cream background
    doc.setFillColor(253, 251, 247);
    doc.rect(0, 0, w, h, "F");

    // Simple navy border
    doc.setDrawColor(30, 58, 95);
    doc.setLineWidth(2);
    doc.rect(10, 10, w - 20, h - 20);
    doc.setLineWidth(0.5);
    doc.rect(14, 14, w - 28, h - 28);

    // Corner flourishes
    doc.setDrawColor(180, 160, 120);
    doc.setLineWidth(1);
    const fl = 20;
    doc.line(10, 10, 10 + fl, 10);
    doc.line(10, 10, 10, 10 + fl);
    doc.line(w - 10, 10, w - 10 - fl, 10);
    doc.line(w - 10, 10, w - 10, 10 + fl);
    doc.line(10, h - 10, 10 + fl, h - 10);
    doc.line(10, h - 10, 10, h - 10 - fl);
    doc.line(w - 10, h - 10, w - 10 - fl, h - 10);
    doc.line(w - 10, h - 10, w - 10, h - 10 - fl);

    // Logo W - smaller and rotated
    doc.setFont("times", "bold");
    doc.setFontSize(35);
    doc.setTextColor(30, 58, 95);
    doc.text("W", cx, 42, { align: "center", angle: -10 });

    // Company name
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(80, 80, 80);
    doc.text(certData.companyName, cx, 55, { align: "center" });

    // Decorative gold lines
    doc.setDrawColor(180, 160, 120);
    doc.setLineWidth(0.5);
    doc.line(cx - 50, 62, cx - 10, 62);
    doc.line(cx + 10, 62, cx + 50, 62);
    doc.setFillColor(180, 160, 120);
    doc.circle(cx, 62, 1.5, "F");

    // Certificate title
    doc.setFontSize(26);
    doc.setFont("times", "bold");
    doc.setTextColor(30, 58, 95);
    let title = type === "program" ? "Certificate of Completion"
      : type === "participation" ? "Certificate of Participation"
        : "Internship Certificate";
    doc.text(title, cx, 82, { align: "center" });

    // Subtitle decorative lines
    doc.setDrawColor(180, 160, 120);
    doc.setLineWidth(0.5);
    doc.line(cx - 60, 90, cx - 10, 90);
    doc.line(cx + 10, 90, cx + 60, 90);
    doc.setFillColor(180, 160, 120);
    doc.circle(cx, 90, 1.5, "F");

    // This is to certify
    doc.setFontSize(12);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(80, 80, 80);
    doc.text("This is to certify that", cx, 110, { align: "center" });

    // Recipient name - BIG
    doc.setFontSize(26);
    doc.setFont("times", "bold");
    doc.setTextColor(30, 58, 95);
    doc.text(certData.recipientName, cx, 130, { align: "center" });

    // Line under name
    doc.setDrawColor(30, 58, 95);
    doc.setLineWidth(0.5);
    doc.line(40, 136, w - 40, 136);

    // Has completed text
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    let completionText = type === "program" ? "has successfully completed the course"
      : type === "participation" ? "has actively participated in"
        : "has completed the internship as";
    doc.text(completionText, cx, 152, { align: "center" });

    // Course name
    doc.setFontSize(18);
    doc.setFont("times", "bold");
    doc.setTextColor(30, 58, 95);
    doc.text(certData.courseName, cx, 168, { align: "center" });

    // Duration
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`${certData.startDate}  -  ${certData.endDate}`, cx, 182, { align: "center" });

    // Credentials text
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    const credLines = doc.splitTextToSize(certData.credentials, w - 80);
    doc.text(credLines, cx, 198, { align: "center" });

    // Signature area - position from bottom
    const sigY = h - 55;

    // Signature line
    doc.setDrawColor(80, 80, 80);
    doc.setLineWidth(0.5);
    doc.line(cx - 30, sigY, cx + 30, sigY);

    // Director name
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(50, 50, 50);
    doc.text(certData.programDirector, cx, sigY + 6, { align: "center" });

    // Director title
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("Program Director", cx, sigY + 12, { align: "center" });

    // Footer line
    doc.setDrawColor(180, 160, 120);
    doc.setLineWidth(0.5);
    doc.line(30, h - 28, w - 30, h - 28);

    // Footer info
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`Issued: ${certData.endDate}`, 30, h - 20);
    doc.text(`ID: ${certData.certificateId}`, w - 30, h - 20, { align: "right" });

    doc.save(`${certData.recipientName}_${type}_Certificate.pdf`);
    showAlert("Certificate downloaded successfully!", "success");
  };


  const renderCertificates = () => {
    if (
      certificates.pCertificates.length === 0 &&
      certificates.iCertificates.length === 0 &&
      certificates.cCertificates.length === 0
    ) {
      return (
        <>
          <CertificateCard
            data={programCertificateData}
            type="program"
            onDownload={() =>
              generateCertificate(programCertificateData, "program")
            }
          />
          <CertificateCard
            data={participationCertificateData}
            type="participation"
            onDownload={() =>
              generateCertificate(participationCertificateData, "participation")
            }
          />
          <CertificateCard
            data={internshipCertificateData}
            type="internship"
            onDownload={() =>
              generateCertificate(internshipCertificateData, "internship")
            }
          />
        </>
      );
    } else {
      return (
        <>
          {certificates.pCertificates.map((cert, index) => (
            <CertificateCard
              key={index}
              data={{
                companyName: "WorldsAiBot",
                recipientName: cert.name || "Student Name",
                courseName: cert.courseName || "Course Name",
                startDate: cert.startDate || "Start Date",
                endDate: cert.endDate || "End Date",
                certificateId: `WAB-PC-${new Date().getFullYear()}-${String(index + 1).padStart(3, '0')}`,
                programDirector: "N.Prasanth Kumar",
                credentials:
                  "This e-certificate validates the successful completion of the program, including practical projects and assessments.",
              }}
              type="program"
              onDownload={() =>
                generateCertificate(
                  {
                    companyName: "WorldsAiBot",
                    recipientName: cert.name || "Student Name",
                    courseName: cert.courseName || "Course Name",
                    startDate: cert.startDate || "Start Date",
                    endDate: cert.endDate || "End Date",
                    certificateId: `WAB-PC-${new Date().getFullYear()}-${String(index + 1).padStart(3, '0')}`,
                    programDirector: "N.Prasanth Kumar",
                    credentials:
                      "This e-certificate validates the successful completion of the program, including practical projects and assessments.",
                  },
                  "program"
                )
              }
            />
          ))}
          {certificates.iCertificates.map((cert, index) => (
            <CertificateCard
              key={index}
              data={{
                companyName: "WorldsAiBot",
                recipientName: cert.name || "Student Name",
                courseName: cert.courseName || "Internship Role",
                startDate: cert.startDate || "Start Date",
                endDate: cert.endDate || "End Date",
                certificateId: `WAB-IC-${new Date().getFullYear()}-${String(index + 1).padStart(3, '0')}`,
                programDirector: "N.Prasanth Kumar",
                credentials:
                  "This e-certificate is awarded for successfully completing the internship program.",
              }}
              type="internship"
              onDownload={() =>
                generateCertificate(
                  {
                    companyName: "WorldsAiBot",
                    recipientName: cert.name || "Student Name",
                    courseName: cert.courseName || "Internship Role",
                    startDate: cert.startDate || "Start Date",
                    endDate: cert.endDate || "End Date",
                    certificateId: `WAB-IC-${new Date().getFullYear()}-${String(index + 1).padStart(3, '0')}`,
                    programDirector: "N.Prasanth Kumar",
                    credentials:
                      "This e-certificate is awarded for successfully completing the internship program.",
                  },
                  "internship"
                )
              }
            />
          ))}
          {certificates.cCertificates.map((cert, index) => (
            <CertificateCard
              key={index}
              data={{
                companyName: "WorldsAiBot",
                recipientName: cert.name || "Student Name",
                courseName: cert.courseName || "Event Name",
                startDate: cert.startDate || "Start Date",
                endDate: cert.endDate || "End Date",
                certificateId: `WAB-CC-${new Date().getFullYear()}-${String(index + 1).padStart(3, '0')}`,
                programDirector: "N.Prasanth Kumar",
                credentials:
                  "This e-certificate is awarded for active participation in the event.",
              }}
              type="participation"
              onDownload={() =>
                generateCertificate(
                  {
                    companyName: "WorldsAiBot",
                    recipientName: cert.name || "Student Name",
                    courseName: cert.courseName || "Event Name",
                    startDate: cert.startDate || "Start Date",
                    endDate: cert.endDate || "End Date",
                    certificateId: `WAB-CC-${new Date().getFullYear()}-${String(index + 1).padStart(3, '0')}`,
                    programDirector: "N.Prasanth Kumar",
                    credentials:
                      "This e-certificate is awarded for active participation in the event.",
                  },
                  "participation"
                )
              }
            />
          ))}
        </>
      );
    }
  };

  return (
    <div className="p-2 h-full bg-gray-950 overflow-y-auto pb-[130px] md:pb-0">
      {/* Alert Component */}
      {alert && (
        <div
          className={`fixed top-[90px] left-1/2 -translate-x-1/2 sm:bottom-4 sm:right-4 sm:top-auto sm:left-auto sm:translate-x-0 px-4 py-3 rounded-lg text-white shadow-lg transition-all duration-300 z-[100] ${alert.type === 'success'
            ? 'bg-green-600'
            : alert.type === 'info'
              ? 'bg-blue-600'
              : 'bg-red-600'
            } flex flex-col w-80 ${alert.visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <div className="flex items-center space-x-2">
            <span className="flex-1">{alert.message}</span>
            <button
              onClick={dismissAlert}
              className="text-white hover:text-gray-200 focus:outline-none"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <div className="w-full h-1 mt-2 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all ease-linear"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="text-center mb-10">
        <h1 className="text-5xl font-black mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Your Certificates
        </h1>
        <p className="text-gray-400 text-lg">
          Download and share your achievements
        </p>
      </div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {renderCertificates()}
      </div>
    </div>
  );
}

export default Awards;