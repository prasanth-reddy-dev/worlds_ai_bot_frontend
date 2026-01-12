import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';

function Resume() {
  const resumePreviewRef = useRef(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [resumeData, setResumeData] = useState({
    personal: { name: 'John Doe', mobile: '+1234567890', email: 'john.doe@example.com', linkedin: 'linkedin.com/in/johndoe' },
    careerObjective: 'To leverage my skills in software development and contribute to innovative projects.',
    experience: [
      { title: 'Software Engineer', company: 'Tech Corp', duration: '2020-2023' },
      { title: 'Junior Developer', company: 'InnoSoft', duration: '2018-2020' }
    ],
    education: [
      { degree: 'B.S. Computer Science', institution: 'State University', year: '2018' }
    ],
    skills: [
      { name: 'JavaScript', description: 'Advanced proficiency' },
      { name: 'React', description: 'Building dynamic UIs' },
      { name: 'Python', description: '' }
    ],
    projects: [
      { title: 'E-Commerce Platform', description: 'Built a full-stack application using React and Node.js.' },
      { title: 'Task Manager', description: 'Developed a productivity app with Python and Flask.' }
    ],
    certifications: [
      { title: 'AWS Certified Developer', issuer: 'Amazon', year: '2022' }
    ],
    achievements: [
      { title: 'Employee of the Year', description: 'Recognized for outstanding performance at Tech Corp.' }
    ]
  });

  const [currentExp, setCurrentExp] = useState({ title: '', company: '', duration: '' });
  const [currentEdu, setCurrentEdu] = useState({ degree: '', institution: '', year: '' });
  const [currentSkill, setCurrentSkill] = useState({ name: '', description: '' });
  const [currentProject, setCurrentProject] = useState({ title: '', description: '' });
  const [currentCert, setCurrentCert] = useState({ title: '', issuer: '', year: '' });
  const [currentAchievement, setCurrentAchievement] = useState({ title: '', description: '' });
  const [isDownloadEnabled, setIsDownloadEnabled] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [errors, setErrors] = useState({ name: '', mobile: '', email: '' });

  const templates = {
    singleColumnLeft: { name: 'Single Column (Left)', layout: 'singleColumnLeft', description: 'Traditional single-column layout, left-aligned.' },
    twoColumn: { name: 'Two Column', layout: 'twoColumn', description: 'Skills and certifications on the left, main content on the right.' },
    centered: { name: 'Centered', layout: 'centered', description: 'All content centered for a balanced look.' },
    compact: { name: 'Compact', layout: 'compact', description: 'Tight single-column layout with minimal spacing.' },
    sidebarRight: { name: 'Sidebar Right', layout: 'sidebarRight', description: 'Main content on the left, skills/certifications on the right.' },
    stackedSections: { name: 'Stacked Sections', layout: 'stackedSections', description: 'Section headers with stacked content blocks.' },
  };

  useEffect(() => {
    const { personal, careerObjective, experience, education, skills } = resumeData;
    const isPersonalComplete = personal.name && personal.mobile && personal.email && !errors.name && !errors.mobile && !errors.email;
    const hasCoreContent = careerObjective && experience.length > 0 && education.length > 0 && skills.length > 0;
    setIsDownloadEnabled(isPersonalComplete && hasCoreContent);
  }, [resumeData, errors]);

  const validateField = (field, value) => {
    switch (field) {
      case 'name':
        setErrors(prev => ({ ...prev, name: value ? '' : 'Name is required' }));
        return !!value;
      case 'mobile':
        const mobileRegex = /^\+[0-9]{10,15}$/;
        setErrors(prev => ({ ...prev, mobile: mobileRegex.test(value) ? '' : 'Enter a valid phone number (e.g., +1234567890)' }));
        return mobileRegex.test(value);
      case 'email':
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        setErrors(prev => ({ ...prev, email: emailRegex.test(value) ? '' : 'Enter a valid email (e.g., name@domain.com)' }));
        return emailRegex.test(value);
      default:
        return true;
    }
  };

  const handlePersonalChange = (field, value) => {
    setResumeData(prev => ({ ...prev, personal: { ...prev.personal, [field]: value } }));
    validateField(field, value);
  };

  const addItem = (type, currentItem, setCurrentItem) => {
    const requiredFields = {
      experience: ['title', 'company'],
      education: ['degree', 'institution'],
      skills: ['name'],
      projects: ['title'],
      certifications: ['title', 'issuer'],
      achievements: ['title']
    };
    const isValid = requiredFields[type].every(field => currentItem[field]);
    if (isValid) {
      setResumeData(prev => ({ ...prev, [type]: [...prev[type], currentItem] }));
      setCurrentItem(Object.fromEntries(Object.keys(currentItem).map(key => [key, ''])));
    } else {
      alert(`Please fill in all required fields for ${type}.`);
    }
  };

  const removeItem = (type, index) => {
    setResumeData(prev => ({ ...prev, [type]: prev[type].filter((_, i) => i !== index) }));
  };

  const downloadResume = async () => {
    if (!isDownloadEnabled || isDownloading || !selectedTemplate) return;
    setIsDownloading(true);

    try {
      const pdf = new jsPDF('p', 'pt', 'a4');
      const margin = 40;
      const pageWidth = 595;
      let yPos = margin;

      pdf.setFont('helvetica', 'normal');

      const addText = (text, x, y, options = {}) => {
        const maxWidth = options.maxWidth || pageWidth - 2 * margin;
        const lineHeight = options.lineHeight || 14;
        const lines = pdf.splitTextToSize(text, maxWidth);
        pdf.text(lines, x, y, options);
        return lines.length * lineHeight;
      };

      const addSectionHeader = (title, x, y, width) => {
        pdf.setFontSize(14);
        pdf.setTextColor(30, 58, 138);
        pdf.setFont('helvetica', 'bold');
        y += addText(title, x, y, { maxWidth: width });
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        return y + 15;
      };

      const checkPageOverflow = (y, height) => {
        if (y + height > 780) {
          pdf.addPage();
          return margin;
        }
        return y;
      };

      const layout = templates[selectedTemplate].layout;

      if (layout === 'twoColumn') {
        const leftWidth = 200; // 35% of usable width
        const columnGap = 25; // 5% gap
        const rightWidth = 340; // 60% of usable width
        const rightX = margin + leftWidth + columnGap;
        let leftY = yPos;
        let rightY = yPos;

        // Header (full width)
        pdf.setFontSize(20);
        pdf.setTextColor(30, 58, 138);
        pdf.setFont('helvetica', 'bold');
        yPos += addText(resumeData.personal.name, margin, yPos, { maxWidth: pageWidth - 2 * margin });
        yPos += 10;
        pdf.setFontSize(9);
        pdf.setTextColor(75, 85, 99);
        yPos += addText(
          [resumeData.personal.mobile, resumeData.personal.email, resumeData.personal.linkedin].filter(Boolean).join(' | '),
          margin,
          yPos,
          { maxWidth: pageWidth - 2 * margin }
        );
        yPos += 12;
        pdf.setLineWidth(1.5);
        pdf.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 15;
        leftY = rightY = yPos;

        // Left Column: Skills
        if (resumeData.skills.length > 0) {
          leftY = addSectionHeader('Skills', margin, leftY, leftWidth);
          resumeData.skills.forEach(skill => {
            leftY = checkPageOverflow(leftY, 30);
            const skillText = `• ${skill.name}${skill.description ? ': ' + skill.description : ''}`;
            leftY += addText(skillText, margin + 10, leftY, { maxWidth: leftWidth - 20, lineHeight: 12 });
            leftY += 12;
          });
          leftY += 10;
        }

        // Left Column: Certifications
        if (resumeData.certifications.length > 0) {
          leftY = addSectionHeader('Certifications', margin, leftY, leftWidth);
          resumeData.certifications.forEach(cert => {
            leftY = checkPageOverflow(leftY, 30);
            const certText = `• ${cert.title} (${cert.issuer}, ${cert.year})`;
            leftY += addText(certText, margin + 10, leftY, { maxWidth: leftWidth - 20, lineHeight: 12 });
            leftY += 12;
          });
          leftY += 10;
        }

        // Right Column: Career Objective
        if (resumeData.careerObjective) {
          rightY = addSectionHeader('Career Objective', rightX, rightY, rightWidth);
          rightY = checkPageOverflow(rightY, 40);
          rightY += addText(resumeData.careerObjective, rightX, rightY, { maxWidth: rightWidth - 20, lineHeight: 14 });
          rightY += 15;
        }

        // Right Column: Experience
        if (resumeData.experience.length > 0) {
          rightY = addSectionHeader('Experience', rightX, rightY, rightWidth);
          resumeData.experience.forEach(exp => {
            rightY = checkPageOverflow(rightY, 40);
            pdf.setFont('helvetica', 'bold');
            rightY += addText(exp.title, rightX, rightY, { maxWidth: rightWidth - 20 });
            pdf.setFont('helvetica', 'normal');
            rightY += 6;
            rightY += addText(`${exp.company} | ${exp.duration}`, rightX, rightY, { maxWidth: rightWidth - 20, lineHeight: 12 });
            rightY += 12;
          });
          rightY += 10;
        }

        // Right Column: Education
        if (resumeData.education.length > 0) {
          rightY = addSectionHeader('Education', rightX, rightY, rightWidth);
          resumeData.education.forEach(edu => {
            rightY = checkPageOverflow(rightY, 40);
            pdf.setFont('helvetica', 'bold');
            rightY += addText(edu.degree, rightX, rightY, { maxWidth: rightWidth - 20 });
            pdf.setFont('helvetica', 'normal');
            rightY += 6;
            rightY += addText(`${edu.institution} | ${edu.year}`, rightX, rightY, { maxWidth: rightWidth - 20, lineHeight: 12 });
            rightY += 12;
          });
          rightY += 10;
        }

        // Right Column: Projects
        if (resumeData.projects.length > 0) {
          rightY = addSectionHeader('Projects', rightX, rightY, rightWidth);
          resumeData.projects.forEach(proj => {
            rightY = checkPageOverflow(rightY, 40);
            pdf.setFont('helvetica', 'bold');
            rightY += addText(proj.title, rightX, rightY, { maxWidth: rightWidth - 20 });
            pdf.setFont('helvetica', 'normal');
            rightY += 6;
            rightY += addText(proj.description || '', rightX, rightY, { maxWidth: rightWidth - 20, lineHeight: 14 });
            rightY += 12;
          });
          rightY += 10;
        }

        // Right Column: Achievements
        if (resumeData.achievements.length > 0) {
          rightY = addSectionHeader('Achievements', rightX, rightY, rightWidth);
          resumeData.achievements.forEach(ach => {
            rightY = checkPageOverflow(rightY, 40);
            pdf.setFont('helvetica', 'bold');
            rightY += addText(ach.title, rightX, rightY, { maxWidth: rightWidth - 20 });
            pdf.setFont('helvetica', 'normal');
            rightY += 6;
            rightY += addText(ach.description || '', rightX, rightY, { maxWidth: rightWidth - 20, lineHeight: 14 });
            rightY += 12;
          });
          rightY += 10;
        }

        yPos = Math.max(leftY, rightY);
      } else if (layout === 'singleColumnLeft') {
        // Header
        pdf.setFontSize(22);
        pdf.setTextColor(30, 58, 138);
        pdf.setFont('helvetica', 'bold');
        yPos += addText(resumeData.personal.name, margin, yPos, { maxWidth: pageWidth - 2 * margin });
        yPos += 10;
        pdf.setFontSize(10);
        pdf.setTextColor(75, 85, 99);
        yPos += addText(
          [resumeData.personal.mobile, resumeData.personal.email, resumeData.personal.linkedin].filter(Boolean).join(' | '),
          margin,
          yPos,
          { maxWidth: pageWidth - 2 * margin }
        );
        yPos += 15;
        pdf.setLineWidth(2);
        pdf.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 20;

        const renderSection = (title, contentFn, xPos, width) => {
          if (!contentFn) return yPos;
          yPos = addSectionHeader(title, xPos, yPos, width);
          contentFn();
          pdf.line(xPos, yPos, xPos + width, yPos);
          yPos += 30;
          return yPos;
        };

        renderSection('Career Objective', () => {
          yPos = checkPageOverflow(yPos, 40);
          yPos += addText(resumeData.careerObjective, margin, yPos, { maxWidth: pageWidth - 2 * margin - 20 });
          yPos += 15;
        }, margin, pageWidth - 2 * margin);

        renderSection('Experience', () => {
          resumeData.experience.forEach(exp => {
            yPos = checkPageOverflow(yPos, 40);
            pdf.setFont('helvetica', 'bold');
            yPos += addText(exp.title, margin, yPos, { maxWidth: pageWidth - 2 * margin - 20 });
            pdf.setFont('helvetica', 'normal');
            yPos += 5;
            yPos += addText(`${exp.company} | ${exp.duration}`, margin, yPos, { maxWidth: pageWidth - 2 * margin - 20 });
            yPos += 12;
          });
        }, margin, pageWidth - 2 * margin);

        renderSection('Education', () => {
          resumeData.education.forEach(edu => {
            yPos = checkPageOverflow(yPos, 40);
            pdf.setFont('helvetica', 'bold');
            yPos += addText(edu.degree, margin, yPos, { maxWidth: pageWidth - 2 * margin - 20 });
            pdf.setFont('helvetica', 'normal');
            yPos += 5;
            yPos += addText(`${edu.institution} | ${edu.year}`, margin, yPos, { maxWidth: pageWidth - 2 * margin - 20 });
            yPos += 12;
          });
        }, margin, pageWidth - 2 * margin);

        renderSection('Skills', () => {
          resumeData.skills.forEach(skill => {
            yPos = checkPageOverflow(yPos, 30);
            const skillText = `• ${skill.name}${skill.description ? ': ' + skill.description : ''}`;
            yPos += addText(skillText, margin + 20, yPos, { maxWidth: pageWidth - 2 * margin - 40 });
            yPos += 12;
          });
        }, margin, pageWidth - 2 * margin);

        renderSection('Projects', () => {
          resumeData.projects.forEach(proj => {
            yPos = checkPageOverflow(yPos, 40);
            pdf.setFont('helvetica', 'bold');
            yPos += addText(proj.title, margin, yPos, { maxWidth: pageWidth - 2 * margin - 20 });
            pdf.setFont('helvetica', 'normal');
            yPos += 5;
            yPos += addText(proj.description || '', margin, yPos, { maxWidth: pageWidth - 2 * margin - 20 });
            yPos += 12;
          });
        }, margin, pageWidth - 2 * margin);

        renderSection('Certifications', () => {
          resumeData.certifications.forEach(cert => {
            yPos = checkPageOverflow(yPos, 30);
            const certText = `• ${cert.title} (${cert.issuer}, ${cert.year})`;
            yPos += addText(certText, margin + 20, yPos, { maxWidth: pageWidth - 2 * margin - 40 });
            yPos += 12;
          });
        }, margin, pageWidth - 2 * margin);

        renderSection('Achievements', () => {
          resumeData.achievements.forEach(ach => {
            yPos = checkPageOverflow(yPos, 40);
            pdf.setFont('helvetica', 'bold');
            yPos += addText(ach.title, margin, yPos, { maxWidth: pageWidth - 2 * margin - 20 });
            pdf.setFont('helvetica', 'normal');
            yPos += 5;
            yPos += addText(ach.description || '', margin, yPos, { maxWidth: pageWidth - 2 * margin - 20 });
            yPos += 12;
          });
        }, margin, pageWidth - 2 * margin);
      } else if (layout === 'centered') {
        // Header
        pdf.setFontSize(22);
        pdf.setTextColor(30, 58, 138);
        pdf.setFont('helvetica', 'bold');
        yPos += addText(resumeData.personal.name, pageWidth / 2, yPos, { align: 'center', maxWidth: pageWidth - 2 * margin });
        yPos += 10;
        pdf.setFontSize(10);
        pdf.setTextColor(75, 85, 99);
        yPos += addText(
          [resumeData.personal.mobile, resumeData.personal.email, resumeData.personal.linkedin].filter(Boolean).join(' | '),
          pageWidth / 2,
          yPos,
          { align: 'center', maxWidth: pageWidth - 2 * margin }
        );
        yPos += 15;
        pdf.setLineWidth(2);
        pdf.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 20;

        const renderSection = (title, contentFn, xPos, width) => {
          if (!contentFn) return yPos;
          pdf.setFontSize(14);
          pdf.setTextColor(30, 58, 138);
          pdf.setFont('helvetica', 'bold');
          yPos += addText(title, xPos, yPos, { align: 'center', maxWidth: width });
          yPos += 25;
          pdf.setFontSize(10);
          pdf.setTextColor(0, 0, 0);
          pdf.setFont('helvetica', 'normal');
          contentFn();
          pdf.line(xPos, yPos, xPos + width, yPos);
          yPos += 30;
          return yPos;
        };

        renderSection('Career Objective', () => {
          yPos = checkPageOverflow(yPos, 40);
          yPos += addText(resumeData.careerObjective, pageWidth / 2, yPos, { align: 'center', maxWidth: pageWidth - 2 * margin - 20 });
          yPos += 15;
        }, margin, pageWidth - 2 * margin);

        renderSection('Experience', () => {
          resumeData.experience.forEach(exp => {
            yPos = checkPageOverflow(yPos, 40);
            pdf.setFont('helvetica', 'bold');
            yPos += addText(exp.title, pageWidth / 2, yPos, { align: 'center', maxWidth: pageWidth - 2 * margin - 20 });
            pdf.setFont('helvetica', 'normal');
            yPos += 5;
            yPos += addText(`${exp.company} | ${exp.duration}`, pageWidth / 2, yPos, { align: 'center', maxWidth: pageWidth - 2 * margin - 20 });
            yPos += 12;
          });
        }, margin, pageWidth - 2 * margin);

        renderSection('Education', () => {
          resumeData.education.forEach(edu => {
            yPos = checkPageOverflow(yPos, 40);
            pdf.setFont('helvetica', 'bold');
            yPos += addText(edu.degree, pageWidth / 2, yPos, { align: 'center', maxWidth: pageWidth - 2 * margin - 20 });
            pdf.setFont('helvetica', 'normal');
            yPos += 5;
            yPos += addText(`${edu.institution} | ${edu.year}`, pageWidth / 2, yPos, { align: 'center', maxWidth: pageWidth - 2 * margin - 20 });
            yPos += 12;
          });
        }, margin, pageWidth - 2 * margin);

        renderSection('Skills', () => {
          resumeData.skills.forEach(skill => {
            yPos = checkPageOverflow(yPos, 30);
            const skillText = `• ${skill.name}${skill.description ? ': ' + skill.description : ''}`;
            yPos += addText(skillText, pageWidth / 2, yPos, { align: 'center', maxWidth: pageWidth - 2 * margin - 20 });
            yPos += 12;
          });
        }, margin, pageWidth - 2 * margin);

        renderSection('Projects', () => {
          resumeData.projects.forEach(proj => {
            yPos = checkPageOverflow(yPos, 40);
            pdf.setFont('helvetica', 'bold');
            yPos += addText(proj.title, pageWidth / 2, yPos, { align: 'center', maxWidth: pageWidth - 2 * margin - 20 });
            pdf.setFont('helvetica', 'normal');
            yPos += 5;
            yPos += addText(proj.description || '', pageWidth / 2, yPos, { align: 'center', maxWidth: pageWidth - 2 * margin - 20 });
            yPos += 12;
          });
        }, margin, pageWidth - 2 * margin);

        renderSection('Certifications', () => {
          resumeData.certifications.forEach(cert => {
            yPos = checkPageOverflow(yPos, 30);
            const certText = `• ${cert.title} (${cert.issuer}, ${cert.year})`;
            yPos += addText(certText, pageWidth / 2, yPos, { align: 'center', maxWidth: pageWidth - 2 * margin - 20 });
            yPos += 12;
          });
        }, margin, pageWidth - 2 * margin);

        renderSection('Achievements', () => {
          resumeData.achievements.forEach(ach => {
            yPos = checkPageOverflow(yPos, 40);
            pdf.setFont('helvetica', 'bold');
            yPos += addText(ach.title, pageWidth / 2, yPos, { align: 'center', maxWidth: pageWidth - 2 * margin - 20 });
            pdf.setFont('helvetica', 'normal');
            yPos += 5;
            yPos += addText(ach.description || '', pageWidth / 2, yPos, { align: 'center', maxWidth: pageWidth - 2 * margin - 20 });
            yPos += 12;
          });
        }, margin, pageWidth - 2 * margin);
      } else if (layout === 'compact') {
        // Header
        pdf.setFontSize(20);
        pdf.setTextColor(30, 58, 138);
        pdf.setFont('helvetica', 'bold');
        yPos += addText(resumeData.personal.name, margin, yPos, { maxWidth: pageWidth - 2 * margin });
        yPos += 8;
        pdf.setFontSize(9);
        pdf.setTextColor(75, 85, 99);
        yPos += addText(
          [resumeData.personal.mobile, resumeData.personal.email, resumeData.personal.linkedin].filter(Boolean).join(' | '),
          margin,
          yPos,
          { maxWidth: pageWidth - 2 * margin }
        );
        yPos += 12;
        pdf.setLineWidth(1.5);
        pdf.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 15;

        const renderSection = (title, contentFn, xPos, width) => {
          if (!contentFn) return yPos;
          pdf.setFontSize(12);
          pdf.setTextColor(30, 58, 138);
          pdf.setFont('helvetica', 'bold');
          yPos += addText(title, xPos, yPos, { maxWidth: width });
          yPos += 15;
          pdf.setFontSize(9);
          pdf.setTextColor(0, 0, 0);
          pdf.setFont('helvetica', 'normal');
          contentFn();
          pdf.line(xPos, yPos, xPos + width, yPos);
          yPos += 20;
          return yPos;
        };

        renderSection('Career Objective', () => {
          yPos = checkPageOverflow(yPos, 30);
          yPos += addText(resumeData.careerObjective, margin, yPos, { maxWidth: pageWidth - 2 * margin - 20 });
          yPos += 10;
        }, margin, pageWidth - 2 * margin);

        renderSection('Experience', () => {
          resumeData.experience.forEach(exp => {
            yPos = checkPageOverflow(yPos, 30);
            pdf.setFont('helvetica', 'bold');
            yPos += addText(exp.title, margin, yPos, { maxWidth: pageWidth - 2 * margin - 20 });
            pdf.setFont('helvetica', 'normal');
            yPos += 4;
            yPos += addText(`${exp.company} | ${exp.duration}`, margin, yPos, { maxWidth: pageWidth - 2 * margin - 20 });
            yPos += 8;
          });
        }, margin, pageWidth - 2 * margin);

        renderSection('Education', () => {
          resumeData.education.forEach(edu => {
            yPos = checkPageOverflow(yPos, 30);
            pdf.setFont('helvetica', 'bold');
            yPos += addText(edu.degree, margin, yPos, { maxWidth: pageWidth - 2 * margin - 20 });
            pdf.setFont('helvetica', 'normal');
            yPos += 4;
            yPos += addText(`${edu.institution} | ${edu.year}`, margin, yPos, { maxWidth: pageWidth - 2 * margin - 20 });
            yPos += 8;
          });
        }, margin, pageWidth - 2 * margin);

        renderSection('Skills', () => {
          resumeData.skills.forEach(skill => {
            yPos = checkPageOverflow(yPos, 20);
            const skillText = `• ${skill.name}${skill.description ? ': ' + skill.description : ''}`;
            yPos += addText(skillText, margin + 15, yPos, { maxWidth: pageWidth - 2 * margin - 30 });
            yPos += 8;
          });
        }, margin, pageWidth - 2 * margin);

        renderSection('Projects', () => {
          resumeData.projects.forEach(proj => {
            yPos = checkPageOverflow(yPos, 30);
            pdf.setFont('helvetica', 'bold');
            yPos += addText(proj.title, margin, yPos, { maxWidth: pageWidth - 2 * margin - 20 });
            pdf.setFont('helvetica', 'normal');
            yPos += 4;
            yPos += addText(proj.description || '', margin, yPos, { maxWidth: pageWidth - 2 * margin - 20 });
            yPos += 8;
          });
        }, margin, pageWidth - 2 * margin);

        renderSection('Certifications', () => {
          resumeData.certifications.forEach(cert => {
            yPos = checkPageOverflow(yPos, 20);
            const certText = `• ${cert.title} (${cert.issuer}, ${cert.year})`;
            yPos += addText(certText, margin + 15, yPos, { maxWidth: pageWidth - 2 * margin - 30 });
            yPos += 8;
          });
        }, margin, pageWidth - 2 * margin);

        renderSection('Achievements', () => {
          resumeData.achievements.forEach(ach => {
            yPos = checkPageOverflow(yPos, 30);
            pdf.setFont('helvetica', 'bold');
            yPos += addText(ach.title, margin, yPos, { maxWidth: pageWidth - 2 * margin - 20 });
            pdf.setFont('helvetica', 'normal');
            yPos += 4;
            yPos += addText(ach.description || '', margin, yPos, { maxWidth: pageWidth - 2 * margin - 20 });
            yPos += 8;
          });
        }, margin, pageWidth - 2 * margin);
      } else if (layout === 'sidebarRight') {
        const leftWidth = 355;
        const columnGap = 25;
        const rightX = margin + leftWidth + columnGap;
        const rightWidth = pageWidth - leftWidth - margin - columnGap - margin;
        let leftY = yPos;
        let rightY = yPos;

        // Header
        pdf.setFontSize(22);
        pdf.setTextColor(30, 58, 138);
        pdf.setFont('helvetica', 'bold');
        yPos += addText(resumeData.personal.name, margin, yPos, { maxWidth: pageWidth - 2 * margin });
        yPos += 10;
        pdf.setFontSize(10);
        pdf.setTextColor(75, 85, 99);
        yPos += addText(
          [resumeData.personal.mobile, resumeData.personal.email, resumeData.personal.linkedin].filter(Boolean).join(' | '),
          margin,
          yPos,
          { maxWidth: pageWidth - 2 * margin }
        );
        yPos += 15;
        pdf.setLineWidth(2);
        pdf.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 20;
        leftY = rightY = yPos;

        // Right Column: Skills
        if (resumeData.skills.length > 0) {
          rightY = addSectionHeader('Skills', rightX, rightY, rightWidth);
          resumeData.skills.forEach(skill => {
            rightY = checkPageOverflow(rightY, 30);
            const skillText = `• ${skill.name}${skill.description ? ': ' + skill.description : ''}`;
            rightY += addText(skillText, rightX + 20, rightY, { maxWidth: rightWidth - 30, lineHeight: 10 });
            rightY += 12;
          });
          pdf.line(rightX, rightY, rightX + rightWidth, rightY);
          rightY += 30;
        }

        // Right Column: Certifications
        if (resumeData.certifications.length > 0) {
          rightY = addSectionHeader('Certifications', rightX, rightY, rightWidth);
          resumeData.certifications.forEach(cert => {
            rightY = checkPageOverflow(rightY, 30);
            const certText = `• ${cert.title} (${cert.issuer}, ${cert.year})`;
            rightY += addText(certText, rightX + 20, rightY, { maxWidth: rightWidth - 30, lineHeight: 10 });
            rightY += 12;
          });
          pdf.line(rightX, rightY, rightX + rightWidth, rightY);
          rightY += 30;
        }

        // Left Column: Career Objective
        if (resumeData.careerObjective) {
          leftY = addSectionHeader('Career Objective', margin, leftY, leftWidth);
          leftY = checkPageOverflow(leftY, 40);
          leftY += addText(resumeData.careerObjective, margin, leftY, { maxWidth: leftWidth - 20, lineHeight: 10 });
          leftY += 15;
          pdf.line(margin, leftY, margin + leftWidth, leftY);
          leftY += 30;
        }

        // Left Column: Experience
        if (resumeData.experience.length > 0) {
          leftY = addSectionHeader('Experience', margin, leftY, leftWidth);
          resumeData.experience.forEach(exp => {
            leftY = checkPageOverflow(leftY, 40);
            pdf.setFont('helvetica', 'bold');
            leftY += addText(exp.title, margin, leftY, { maxWidth: leftWidth - 20 });
            pdf.setFont('helvetica', 'normal');
            leftY += 5;
            leftY += addText(`${exp.company} | ${exp.duration}`, margin, leftY, { maxWidth: leftWidth - 20 });
            leftY += 12;
          });
          pdf.line(margin, leftY, margin + leftWidth, leftY);
          leftY += 30;
        }

        // Left Column: Education
        if (resumeData.education.length > 0) {
          leftY = addSectionHeader('Education', margin, leftY, leftWidth);
          resumeData.education.forEach(edu => {
            leftY = checkPageOverflow(leftY, 40);
            pdf.setFont('helvetica', 'bold');
            leftY += addText(edu.degree, margin, leftY, { maxWidth: leftWidth - 20 });
            pdf.setFont('helvetica', 'normal');
            leftY += 5;
            leftY += addText(`${edu.institution} | ${edu.year}`, margin, leftY, { maxWidth: leftWidth - 20 });
            leftY += 12;
          });
          pdf.line(margin, leftY, margin + leftWidth, leftY);
          leftY += 30;
        }

        // Left Column: Projects
        if (resumeData.projects.length > 0) {
          leftY = addSectionHeader('Projects', margin, leftY, leftWidth);
          resumeData.projects.forEach(proj => {
            leftY = checkPageOverflow(leftY, 40);
            pdf.setFont('helvetica', 'bold');
            leftY += addText(proj.title, margin, leftY, { maxWidth: leftWidth - 20 });
            pdf.setFont('helvetica', 'normal');
            leftY += 5;
            leftY += addText(proj.description || '', margin, leftY, { maxWidth: leftWidth - 20, lineHeight: 10 });
            leftY += 12;
          });
          pdf.line(margin, leftY, margin + leftWidth, leftY);
          leftY += 30;
        }

        // Left Column: Achievements
        if (resumeData.achievements.length > 0) {
          leftY = addSectionHeader('Achievements', margin, leftY, leftWidth);
          resumeData.achievements.forEach(ach => {
            leftY = checkPageOverflow(leftY, 40);
            pdf.setFont('helvetica', 'bold');
            leftY += addText(ach.title, margin, leftY, { maxWidth: leftWidth - 20 });
            pdf.setFont('helvetica', 'normal');
            leftY += 5;
            leftY += addText(ach.description || '', margin, leftY, { maxWidth: leftWidth - 20, lineHeight: 10 });
            leftY += 12;
          });
          pdf.line(margin, leftY, margin + leftWidth, leftY);
          leftY += 30;
        }

        yPos = Math.max(leftY, rightY);
      } else if (layout === 'stackedSections') {
        // Header
        pdf.setFontSize(22);
        pdf.setTextColor(30, 58, 138);
        pdf.setFont('helvetica', 'bold');
        yPos += addText(resumeData.personal.name, margin, yPos, { maxWidth: pageWidth - 2 * margin });
        yPos += 10;
        pdf.setFontSize(10);
        pdf.setTextColor(75, 85, 99);
        yPos += addText(
          [resumeData.personal.mobile, resumeData.personal.email, resumeData.personal.linkedin].filter(Boolean).join(' | '),
          margin,
          yPos,
          { maxWidth: pageWidth - 2 * margin }
        );
        yPos += 15;
        pdf.setLineWidth(2);
        pdf.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 20;

        秀
        const renderSection = (title, contentFn, xPos, width) => {
          if (!contentFn) return yPos;
          pdf.setFontSize(14);
          pdf.setTextColor(30, 58, 138);
          pdf.setFont('helvetica', 'normal');
          yPos += addText(title, xPos, yPos, { maxWidth: width });
          yPos += 25;
          pdf.setFontSize(10);
          pdf.setTextColor(0, 0, 0);
          pdf.setFont('helvetica', 'normal');
          contentFn();
          pdf.line(xPos, yPos, xPos + width, yPos);
          yPos += 30;
          return yPos;
        };

        renderSection('Career Objective', () => {
          yPos = checkPageOverflow(yPos, 40);
          yPos += addText(resumeData.careerObjective, margin, yPos, { maxWidth: pageWidth - 2 * margin - 20 });
          yPos += 15;
        }, margin, pageWidth - 2 * margin);

        renderSection('Experience', () => {
          resumeData.experience.forEach(exp => {
            yPos = checkPageOverflow(yPos, 40);
            pdf.setFont('helvetica', 'bold');
            yPos += addText(exp.title, margin, yPos, { maxWidth: pageWidth - 2 * margin - 20 });
            pdf.setFont('helvetica', 'normal');
            yPos += 5;
            yPos += addText(`${exp.company} | ${exp.duration}`, margin, yPos, { maxWidth: pageWidth - 2 * margin - 20 });
            yPos += 12;
          });
        }, margin, pageWidth - 2 * margin);

        renderSection('Education', () => {
          resumeData.education.forEach(edu => {
            yPos = checkPageOverflow(yPos, 40);
            pdf.setFont('helvetica', 'bold');
            yPos += addText(edu.degree, margin, yPos, { maxWidth: pageWidth - 2 * margin - 20 });
            pdf.setFont('helvetica', 'normal');
            yPos += 5;
            yPos += addText(`${edu.institution} | ${edu.year}`, margin, yPos, { maxWidth: pageWidth - 2 * margin - 20 });
            yPos += 12;
          });
        }, margin, pageWidth - 2 * margin);

        renderSection('Skills', () => {
          resumeData.skills.forEach(skill => {
            yPos = checkPageOverflow(yPos, 30);
            const skillText = `• ${skill.name}${skill.description ? ': ' + skill.description : ''}`;
            yPos += addText(skillText, margin + 20, yPos, { maxWidth: pageWidth - 2 * margin - 40 });
            yPos += 12;
          });
        }, margin, pageWidth - 2 * margin);

        renderSection('Projects', () => {
          resumeData.projects.forEach(proj => {
            yPos = checkPageOverflow(yPos, 40);
            pdf.setFont('helvetica', 'bold');
            yPos += addText(proj.title, margin, yPos, { maxWidth: pageWidth - 2 * margin - 20 });
            pdf.setFont('helvetica', 'normal');
            yPos += 5;
            yPos += addText(proj.description || '', margin, yPos, { maxWidth: pageWidth - 2 * margin - 20 });
            yPos += 12;
          });
        }, margin, pageWidth - 2 * margin);

        renderSection('Certifications', () => {
          resumeData.certifications.forEach(cert => {
            yPos = checkPageOverflow(yPos, 30);
            const certText = `• ${cert.title} (${cert.issuer}, ${cert.year})`;
            yPos += addText(certText, margin + 20, yPos, { maxWidth: pageWidth - 2 * margin - 40 });
            yPos += 12;
          });
        }, margin, pageWidth - 2 * margin);

        renderSection('Achievements', () => {
          resumeData.achievements.forEach(ach => {
            yPos = checkPageOverflow(yPos, 40);
            pdf.setFont('helvetica', 'bold');
            yPos += addText(ach.title, margin, yPos, { maxWidth: pageWidth - 2 * margin - 20 });
            pdf.setFont('helvetica', 'normal');
            yPos += 5;
            yPos += addText(ach.description || '', margin, yPos, { maxWidth: pageWidth - 2 * margin - 20 });
            yPos += 12;
          });
        }, margin, pageWidth - 2 * margin);
      }

      pdf.save(`${resumeData.personal.name}_${selectedTemplate}.pdf`);
    } catch (error) {
      console.error('PDF Generation Error:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const renderTemplateSelection = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Resume Templates
          </h1>
          <p className="text-gray-400 text-lg">Choose a professional template to build your resume</p>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(templates).map(([key, template]) => (
            <div
              key={key}
              onClick={() => setSelectedTemplate(key)}
              className="group cursor-pointer"
            >
              {/* Card */}
              <div className="relative bg-slate-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-1">
                {/* Preview Area */}
                <div className="p-4 bg-white rounded-t-xl mx-3 mt-3">
                  <div style={{
                    height: '140px',
                    fontFamily: 'Helvetica, sans-serif',
                    fontSize: '8px',
                    color: '#000',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{ textAlign: template.layout === 'centered' ? 'center' : 'left', width: '100%' }}>
                      <h4 style={{ fontSize: '13px', color: '#1e3a8a', fontWeight: 'bold', marginBottom: '4px' }}>
                        John Doe
                      </h4>
                      <p style={{ fontSize: '7px', color: '#6b7280', marginBottom: '8px' }}>
                        +1234567890 | john.doe@example.com
                      </p>
                      <hr style={{ border: '0.5px solid #3b82f6', marginBottom: '10px' }} />
                      <h5 style={{ fontSize: '9px', color: '#1e3a8a', fontWeight: template.layout === 'stackedSections' ? 'normal' : 'bold', marginBottom: '3px' }}>
                        Experience
                      </h5>
                      <p style={{ fontWeight: 'bold', fontSize: '8px' }}>Software Engineer</p>
                      <p style={{ fontSize: '7px', color: '#6b7280' }}>Tech Corp | 2020-2023</p>
                    </div>
                    {(template.layout === 'twoColumn' || template.layout === 'sidebarRight') && (
                      <div style={{
                        position: 'absolute',
                        top: '0',
                        right: template.layout === 'sidebarRight' ? '0' : 'auto',
                        left: template.layout === 'twoColumn' ? '0' : 'auto',
                        width: '30%',
                        fontSize: '7px',
                        padding: '4px',
                        background: '#f8fafc'
                      }}>
                        <h5 style={{ fontSize: '8px', color: '#1e3a8a', fontWeight: 'bold', marginBottom: '4px' }}>
                          Skills
                        </h5>
                        <p>• JavaScript</p>
                        <p>• React</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info Area */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                    {template.name}
                  </h3>
                  <p className="text-gray-400 text-sm">{template.description}</p>
                </div>

                {/* Select Overlay */}
                <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold text-sm shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                    Select Template
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tips Section */}
        <div className="mt-10 p-6 bg-slate-800/30 rounded-2xl border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <i className="bi bi-lightbulb text-yellow-400"></i>
            Tips for a Great Resume
          </h3>
          <div className="grid sm:grid-cols-3 gap-4 text-sm text-gray-400">
            <div className="flex items-start gap-2">
              <span className="text-blue-400">✓</span>
              <span>Keep it concise and focused on your achievements</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-400">✓</span>
              <span>Use action verbs to describe your experience</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-400">✓</span>
              <span>Tailor your resume for each job application</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSectionPreview = (title, items, renderItem, options = {}) => (
    items.length > 0 && (
      <section style={{ marginBottom: options.compact ? '8px' : '16px' }}>
        <h2 style={{
          fontSize: options.compact ? '12pt' : '14pt',
          color: '#1e3a8a',
          marginBottom: options.compact ? '4px' : '8px',
          fontWeight: options.boldHeader !== false ? 'bold' : 'normal',
          textAlign: options.align || 'left'
        }}>
          {title}
        </h2>
        <div style={{ paddingLeft: options.paddingLeft || '0', textAlign: options.align || 'left' }}>
          {items.map(renderItem)}
        </div>
        <hr style={{ border: '1px solid #1e3a8a', marginTop: options.compact ? '4px' : '8px' }} />
      </section>
    )
  );

  const renderResumeBuilder = () => {
    const layout = templates[selectedTemplate].layout;
    const compact = layout === 'compact';

    return (
      <div className="min-h-screen bg-gray-900 text-white pt-1 h-[600px]">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');`}</style>
        <div className="flex flex-col md:flex-row gap-4 p-1 sm:p-4 max-w-6xl mx-auto h-full pb-[160px]">
          <div className="w-full md:w-1/2 bg-gray-800 rounded-lg shadow-lg p-4 overflow-y-auto h-[calc(100vh-120px)]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Build Resume ({templates[selectedTemplate].name})
              </h2>
              <button onClick={() => setSelectedTemplate(null)} className="text-blue-300 hover:text-blue-400 text-sm">
                Change Template
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-700 p-3 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-blue-300">Personal Details</h3>
                <input value={resumeData.personal.name} onChange={(e) => handlePersonalChange('name', e.target.value)} placeholder="Full Name" className="w-full p-2 mb-2 bg-gray-800 border border-gray-600 rounded text-white" />
                {errors.name && <p className="text-red-400 text-xs">{errors.name}</p>}
                <input value={resumeData.personal.mobile} onChange={(e) => handlePersonalChange('mobile', e.target.value)} placeholder="Mobile (+1234567890)" className="w-full p-2 mb-2 bg-gray-800 border border-gray-600 rounded text-white" />
                {errors.mobile && <p className="text-red-400 text-xs">{errors.mobile}</p>}
                <input value={resumeData.personal.email} onChange={(e) => handlePersonalChange('email', e.target.value)} placeholder="Email (name@domain.com)" className="w-full p-2 mb-2 bg-gray-800 border border-gray-600 rounded text-white" />
                {errors.email && <p className="text-red-400 text-xs">{errors.email}</p>}
                <input value={resumeData.personal.linkedin} onChange={(e) => handlePersonalChange('linkedin', e.target.value)} placeholder="LinkedIn (optional)" className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white" />
              </div>

              <div className="bg-gray-700 p-3 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-blue-300">Career Objective</h3>
                <textarea value={resumeData.careerObjective} onChange={(e) => setResumeData(prev => ({ ...prev, careerObjective: e.target.value }))} placeholder="Your career objective" className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white" rows="2" />
              </div>

              <div className="bg-gray-700 p-3 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-blue-300">Experience</h3>
                <input value={currentExp.title} onChange={(e) => setCurrentExp(prev => ({ ...prev, title: e.target.value }))} placeholder="Job Title" className="w-full p-2 mb-2 bg-gray-800 border border-gray-600 rounded text-white" />
                <input value={currentExp.company} onChange={(e) => setCurrentExp(prev => ({ ...prev, company: e.target.value }))} placeholder="Company" className="w-full p-2 mb-2 bg-gray-800 border border-gray-600 rounded text-white" />
                <input value={currentExp.duration} onChange={(e) => setCurrentExp(prev => ({ ...prev, duration: e.target.value }))} placeholder="Duration (e.g., 2020-Present)" className="w-full p-2 mb-2 bg-gray-800 border border-gray-600 rounded text-white" />
                <button onClick={() => addItem('experience', currentExp, setCurrentExp)} className="w-full p-2 bg-blue-600 rounded text-white hover:bg-blue-700">Add Experience</button>
                {resumeData.experience.map((exp, index) => (
                  <div key={index} className="flex justify-between items-center mt-2 bg-gray-600 p-2 rounded">
                    <span className="text-sm">{exp.title} - {exp.company}</span>
                    <button onClick={() => removeItem('experience', index)} className="text-red-400">×</button>
                  </div>
                ))}
              </div>

              <div className="bg-gray-700 p-3 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-blue-300">Education</h3>
                <input value={currentEdu.degree} onChange={(e) => setCurrentEdu(prev => ({ ...prev, degree: e.target.value }))} placeholder="Degree" className="w-full p-2 mb-2 bg-gray-800 border border-gray-600 rounded text-white" />
                <input value={currentEdu.institution} onChange={(e) => setCurrentEdu(prev => ({ ...prev, institution: e.target.value }))} placeholder="Institution" className="w-full p-2 mb-2 bg-gray-800 border border-gray-600 rounded text-white" />
                <input value={currentEdu.year} onChange={(e) => setCurrentEdu(prev => ({ ...prev, year: e.target.value }))} placeholder="Year" className="w-full p-2 mb-2 bg-gray-800 border border-gray-600 rounded text-white" />
                <button onClick={() => addItem('education', currentEdu, setCurrentEdu)} className="w-full p-2 bg-blue-600 rounded text-white hover:bg-blue-700">Add Education</button>
                {resumeData.education.map((edu, index) => (
                  <div key={index} className="flex justify-between items-center mt-2 bg-gray-600 p-2 rounded">
                    <span className="text-sm">{edu.degree} - {edu.institution}</span>
                    <button onClick={() => removeItem('education', index)} className="text-red-400">×</button>
                  </div>
                ))}
              </div>

              <div className="bg-gray-700 p-3 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-blue-300">Skills</h3>
                <input value={currentSkill.name} onChange={(e) => setCurrentSkill(prev => ({ ...prev, name: e.target.value }))} placeholder="Skill Name" className="w-full p-2 mb-2 bg-gray-800 border border-gray-600 rounded text-white" />
                <textarea value={currentSkill.description} onChange={(e) => setCurrentSkill(prev => ({ ...prev, description: e.target.value }))} placeholder="Description (optional)" className="w-full p-2 mb-2 bg-gray-800 border border-gray-600 rounded text-white" rows="2" />
                <button onClick={() => addItem('skills', currentSkill, setCurrentSkill)} className="w-full p-2 bg-blue-600 rounded text-white hover:bg-blue-700">Add Skill</button>
                {resumeData.skills.map((skill, index) => (
                  <div key={index} className="flex justify-between items-center mt-2 bg-gray-600 p-2 rounded">
                    <span className="text-sm">{skill.name}</span>
                    <button onClick={() => removeItem('skills', index)} className="text-red-400">×</button>
                  </div>
                ))}
              </div>

              <div className="bg-gray-700 p-3 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-blue-300">Projects</h3>
                <input value={currentProject.title} onChange={(e) => setCurrentProject(prev => ({ ...prev, title: e.target.value }))} placeholder="Project Title" className="w-full p-2 mb-2 bg-gray-800 border border-gray-600 rounded text-white" />
                <textarea value={currentProject.description} onChange={(e) => setCurrentProject(prev => ({ ...prev, description: e.target.value }))} placeholder="Description" className="w-full p-2 mb-2 bg-gray-800 border border-gray-600 rounded text-white" rows="2" />
                <button onClick={() => addItem('projects', currentProject, setCurrentProject)} className="w-full p-2 bg-blue-600 rounded text-white hover:bg-blue-700">Add Project</button>
                {resumeData.projects.map((proj, index) => (
                  <div key={index} className="flex justify-between items-center mt-2 bg-gray-600 p-2 rounded">
                    <span className="text-sm">{proj.title}</span>
                    <button onClick={() => removeItem('projects', index)} className="text-red-400">×</button>
                  </div>
                ))}
              </div>

              <div className="bg-gray-700 p-3 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-blue-300">Certifications</h3>
                <input value={currentCert.title} onChange={(e) => setCurrentCert(prev => ({ ...prev, title: e.target.value }))} placeholder="Certification Title" className="w-full p-2 mb-2 bg-gray-800 border border-gray-600 rounded text-white" />
                <input value={currentCert.issuer} onChange={(e) => setCurrentCert(prev => ({ ...prev, issuer: e.target.value }))} placeholder="Issuer" className="w-full p-2 mb-2 bg-gray-800 border border-gray-600 rounded text-white" />
                <input value={currentCert.year} onChange={(e) => setCurrentCert(prev => ({ ...prev, year: e.target.value }))} placeholder="Year" className="w-full p-2 mb-2 bg-gray-800 border border-gray-600 rounded text-white" />
                <button onClick={() => addItem('certifications', currentCert, setCurrentCert)} className="w-full p-2 bg-blue-600 rounded text-white hover:bg-blue-700">Add Certification</button>
                {resumeData.certifications.map((cert, index) => (
                  <div key={index} className="flex justify-between items-center mt-2 bg-gray-600 p-2 rounded">
                    <span className="text-sm">{cert.title} ({cert.issuer})</span>
                    <button onClick={() => removeItem('certifications', index)} className="text-red-400">×</button>
                  </div>
                ))}
              </div>

              <div className="bg-gray-700 p-3 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-blue-300">Achievements</h3>
                <input value={currentAchievement.title} onChange={(e) => setCurrentAchievement(prev => ({ ...prev, title: e.target.value }))} placeholder="Achievement Title" className="w-full p-2 mb-2 bg-gray-800 border border-gray-600 rounded text-white" />
                <textarea value={currentAchievement.description} onChange={(e) => setCurrentAchievement(prev => ({ ...prev, description: e.target.value }))} placeholder="Description" className="w-full p-2 mb-2 bg-gray-800 border border-gray-600 rounded text-white" rows="2" />
                <button onClick={() => addItem('achievements', currentAchievement, setCurrentAchievement)} className="w-full p-2 bg-blue-600 rounded text-white hover:bg-blue-700">Add Achievement</button>
                {resumeData.achievements.map((ach, index) => (
                  <div key={index} className="flex justify-between items-center mt-2 bg-gray-600 p-2 rounded">
                    <span className="text-sm">{ach.title}</span>
                    <button onClick={() => removeItem('achievements', index)} className="text-red-400">×</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2 bg-gray-800 rounded-lg shadow-lg overflow-hidden h-[calc(100vh-120px)]">
            <div className="bg-gray-700 p-3 flex justify-between items-center">
              <h2 className="text-lg font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>Preview</h2>
              <button
                onClick={downloadResume}
                disabled={!isDownloadEnabled || isDownloading}
                className={`p-2 rounded text-white text-sm ${isDownloadEnabled && !isDownloading ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 cursor-not-allowed'}`}
              >
                {isDownloading ? 'Downloading...' : 'Download PDF'}
              </button>
            </div>
            <div className="p-4 bg-white text-black h-[calc(100vh-60px)] overflow-y-auto pb-[590px] sm:pb-[130px]" style={{ fontFamily: 'Helvetica, sans-serif' }}>
              <div ref={resumePreviewRef} style={{ maxWidth: '595px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '20pt', color: '#1e3a8a', fontWeight: 'bold', marginBottom: '8px', textAlign: layout === 'centered' ? 'center' : 'left' }}>
                  {resumeData.personal.name}
                </h1>
                <p style={{ fontSize: '9pt', color: '#4b5563', marginBottom: '12px', textAlign: layout === 'centered' ? 'center' : 'left' }}>
                  {[resumeData.personal.mobile, resumeData.personal.email, resumeData.personal.linkedin].filter(Boolean).join(' | ')}
                </p>
                <hr style={{ border: '1px solid #1e3a8a', marginBottom: '16px' }} />

                {layout === 'singleColumnLeft' && (
                  <>
                    {renderSectionPreview('Career Objective', [resumeData.careerObjective], (_, i) => (
                      <p key={i} style={{ fontSize: '10pt' }}>{resumeData.careerObjective}</p>
                    ))}
                    {renderSectionPreview('Experience', resumeData.experience, (exp, i) => (
                      <div key={i} style={{ marginBottom: '8px' }}>
                        <strong style={{ fontSize: '11pt' }}>{exp.title}</strong>
                        <p style={{ fontSize: '10pt', color: '#4b5563' }}>{exp.company} | {exp.duration}</p>
                      </div>
                    ))}
                    {renderSectionPreview('Education', resumeData.education, (edu, i) => (
                      <div key={i} style={{ marginBottom: '8px' }}>
                        <strong style={{ fontSize: '11pt' }}>{edu.degree}</strong>
                        <p style={{ fontSize: '10pt', color: '#4b5563' }}>{edu.institution} | {edu.year}</p>
                      </div>
                    ))}
                    {renderSectionPreview('Skills', resumeData.skills, (skill, i) => (
                      <p key={i} style={{ fontSize: '10pt', paddingLeft: '15px' }}>• {skill.name}{skill.description ? `: ${skill.description}` : ''}</p>
                    ))}
                    {renderSectionPreview('Projects', resumeData.projects, (proj, i) => (
                      <div key={i} style={{ marginBottom: '8px' }}>
                        <strong style={{ fontSize: '11pt' }}>{proj.title}</strong>
                        <p style={{ fontSize: '10pt' }}>{proj.description}</p>
                      </div>
                    ))}
                    {renderSectionPreview('Certifications', resumeData.certifications, (cert, i) => (
                      <p key={i} style={{ fontSize: '10pt', paddingLeft: '15px' }}>• {cert.title} ({cert.issuer}, {cert.year})</p>
                    ))}
                    {renderSectionPreview('Achievements', resumeData.achievements, (ach, i) => (
                      <div key={i} style={{ marginBottom: '8px' }}>
                        <strong style={{ fontSize: '11pt' }}>{ach.title}</strong>
                        <p style={{ fontSize: '10pt' }}>{ach.description}</p>
                      </div>
                    ))}
                  </>
                )}

                {layout === 'twoColumn' && (
                  <div style={{ display: 'flex', gap: '25px' }}>
                    <div style={{ width: '200px' }}>
                      {renderSectionPreview('Skills', resumeData.skills, (skill, i) => (
                        <p key={i} style={{ fontSize: '9pt', paddingLeft: '10px', marginBottom: '8px' }}>
                          • {skill.name}{skill.description ? `: ${skill.description}` : ''}
                        </p>
                      ))}
                      {renderSectionPreview('Certifications', resumeData.certifications, (cert, i) => (
                        <p key={i} style={{ fontSize: '9pt', paddingLeft: '10px', marginBottom: '8px' }}>
                          • {cert.title} ({cert.issuer}, {cert.year})
                        </p>
                      ))}
                    </div>
                    <div style={{ width: '340px' }}>
                      {renderSectionPreview('Career Objective', [resumeData.careerObjective], (_, i) => (
                        <p key={i} style={{ fontSize: '10pt' }}>{resumeData.careerObjective}</p>
                      ))}
                      {renderSectionPreview('Experience', resumeData.experience, (exp, i) => (
                        <div key={i} style={{ marginBottom: '8px' }}>
                          <strong style={{ fontSize: '10pt' }}>{exp.title}</strong>
                          <p style={{ fontSize: '9pt', color: '#4b5563' }}>{exp.company} | {exp.duration}</p>
                        </div>
                      ))}
                      {renderSectionPreview('Education', resumeData.education, (edu, i) => (
                        <div key={i} style={{ marginBottom: '8px' }}>
                          <strong style={{ fontSize: '10pt' }}>{edu.degree}</strong>
                          <p style={{ fontSize: '9pt', color: '#4b5563' }}>{edu.institution} | {edu.year}</p>
                        </div>
                      ))}
                      {renderSectionPreview('Projects', resumeData.projects, (proj, i) => (
                        <div key={i} style={{ marginBottom: '8px' }}>
                          <strong style={{ fontSize: '10pt' }}>{proj.title}</strong>
                          <p style={{ fontSize: '9pt' }}>{proj.description}</p>
                        </div>
                      ))}
                      {renderSectionPreview('Achievements', resumeData.achievements, (ach, i) => (
                        <div key={i} style={{ marginBottom: '8px' }}>
                          <strong style={{ fontSize: '10pt' }}>{ach.title}</strong>
                          <p style={{ fontSize: '9pt' }}>{ach.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {layout === 'centered' && (
                  <>
                    {renderSectionPreview('Career Objective', [resumeData.careerObjective], (_, i) => (
                      <p key={i} style={{ fontSize: '10pt' }}>{resumeData.careerObjective}</p>
                    ), { align: 'center' })}
                    {renderSectionPreview('Experience', resumeData.experience, (exp, i) => (
                      <div key={i} style={{ marginBottom: '8px' }}>
                        <strong style={{ fontSize: '11pt' }}>{exp.title}</strong>
                        <p style={{ fontSize: '10pt', color: '#4b5563' }}>{exp.company} | {exp.duration}</p>
                      </div>
                    ), { align: 'center' })}
                    {renderSectionPreview('Education', resumeData.education, (edu, i) => (
                      <div key={i} style={{ marginBottom: '8px' }}>
                        <strong style={{ fontSize: '11pt' }}>{edu.degree}</strong>
                        <p style={{ fontSize: '10pt', color: '#4b5563' }}>{edu.institution} | {edu.year}</p>
                      </div>
                    ), { align: 'center' })}
                    {renderSectionPreview('Skills', resumeData.skills, (skill, i) => (
                      <p key={i} style={{ fontSize: '10pt' }}>• {skill.name}{skill.description ? `: ${skill.description}` : ''}</p>
                    ), { align: 'center' })}
                    {renderSectionPreview('Projects', resumeData.projects, (proj, i) => (
                      <div key={i} style={{ marginBottom: '8px' }}>
                        <strong style={{ fontSize: '11pt' }}>{proj.title}</strong>
                        <p style={{ fontSize: '10pt' }}>{proj.description}</p>
                      </div>
                    ), { align: 'center' })}
                    {renderSectionPreview('Certifications', resumeData.certifications, (cert, i) => (
                      <p key={i} style={{ fontSize: '10pt' }}>• {cert.title} ({cert.issuer}, {cert.year})</p>
                    ), { align: 'center' })}
                    {renderSectionPreview('Achievements', resumeData.achievements, (ach, i) => (
                      <div key={i} style={{ marginBottom: '8px' }}>
                        <strong style={{ fontSize: '11pt' }}>{ach.title}</strong>
                        <p style={{ fontSize: '10pt' }}>{ach.description}</p>
                      </div>
                    ), { align: 'center' })}
                  </>
                )}

                {layout === 'compact' && (
                  <>
                    {renderSectionPreview('Career Objective', [resumeData.careerObjective], (_, i) => (
                      <p key={i} style={{ fontSize: '9pt' }}>{resumeData.careerObjective}</p>
                    ), { compact: true })}
                    {renderSectionPreview('Experience', resumeData.experience, (exp, i) => (
                      <div key={i} style={{ marginBottom: '6px' }}>
                        <strong style={{ fontSize: '10pt' }}>{exp.title}</strong>
                        <p style={{ fontSize: '9pt', color: '#4b5563' }}>{exp.company} | {exp.duration}</p>
                      </div>
                    ), { compact: true })}
                    {renderSectionPreview('Education', resumeData.education, (edu, i) => (
                      <div key={i} style={{ marginBottom: '6px' }}>
                        <strong style={{ fontSize: '10pt' }}>{edu.degree}</strong>
                        <p style={{ fontSize: '9pt', color: '#4b5563' }}>{edu.institution} | {edu.year}</p>
                      </div>
                    ), { compact: true })}
                    {renderSectionPreview('Skills', resumeData.skills, (skill, i) => (
                      <p key={i} style={{ fontSize: '9pt', paddingLeft: '10px' }}>
                        • {skill.name}{skill.description ? `: ${skill.description}` : ''}
                      </p>
                    ), { compact: true, paddingLeft: '10px' })}
                    {renderSectionPreview('Projects', resumeData.projects, (proj, i) => (
                      <div key={i} style={{ marginBottom: '6px' }}>
                        <strong style={{ fontSize: '10pt' }}>{proj.title}</strong>
                        <p style={{ fontSize: '9pt' }}>{proj.description}</p>
                      </div>
                    ), { compact: true })}
                    {renderSectionPreview('Certifications', resumeData.certifications, (cert, i) => (
                      <p key={i} style={{ fontSize: '9pt', paddingLeft: '10px' }}>
                        • {cert.title} ({cert.issuer}, {cert.year})
                      </p>
                    ), { compact: true, paddingLeft: '10px' })}
                    {renderSectionPreview('Achievements', resumeData.achievements, (ach, i) => (
                      <div key={i} style={{ marginBottom: '6px' }}>
                        <strong style={{ fontSize: '10pt' }}>{ach.title}</strong>
                        <p style={{ fontSize: '9pt' }}>{ach.description}</p>
                      </div>
                    ), { compact: true })}
                  </>
                )}

                {layout === 'sidebarRight' && (
                  <div style={{ display: 'flex', gap: '25px' }}>
                    <div style={{ width: '355px' }}>
                      {renderSectionPreview('Career Objective', [resumeData.careerObjective], (_, i) => (
                        <p key={i} style={{ fontSize: '10pt' }}>{resumeData.careerObjective}</p>
                      ))}
                      {renderSectionPreview('Experience', resumeData.experience, (exp, i) => (
                        <div key={i} style={{ marginBottom: '8px' }}>
                          <strong style={{ fontSize: '11pt' }}>{exp.title}</strong>
                          <p style={{ fontSize: '10pt', color: '#4b5563' }}>{exp.company} | {exp.duration}</p>
                        </div>
                      ))}
                      {renderSectionPreview('Education', resumeData.education, (edu, i) => (
                        <div key={i} style={{ marginBottom: '8px' }}>
                          <strong style={{ fontSize: '11pt' }}>{edu.degree}</strong>
                          <p style={{ fontSize: '10pt', color: '#4b5563' }}>{edu.institution} | {edu.year}</p>
                        </div>
                      ))}
                      {renderSectionPreview('Projects', resumeData.projects, (proj, i) => (
                        <div key={i} style={{ marginBottom: '8px' }}>
                          <strong style={{ fontSize: '11pt' }}>{proj.title}</strong>
                          <p style={{ fontSize: '10pt' }}>{proj.description}</p>
                        </div>
                      ))}
                      {renderSectionPreview('Achievements', resumeData.achievements, (ach, i) => (
                        <div key={i} style={{ marginBottom: '8px' }}>
                          <strong style={{ fontSize: '11pt' }}>{ach.title}</strong>
                          <p style={{ fontSize: '10pt' }}>{ach.description}</p>
                        </div>
                      ))}
                    </div>
                    <div style={{ width: '175px' }}>
                      {renderSectionPreview('Skills', resumeData.skills, (skill, i) => (
                        <p key={i} style={{ fontSize: '10pt', paddingLeft: '15px', marginBottom: '8px' }}>
                          • {skill.name}{skill.description ? `: ${skill.description}` : ''}
                        </p>
                      ))}
                      {renderSectionPreview('Certifications', resumeData.certifications, (cert, i) => (
                        <p key={i} style={{ fontSize: '10pt', paddingLeft: '15px', marginBottom: '8px' }}>
                          • {cert.title} ({cert.issuer}, {cert.year})
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {layout === 'stackedSections' && (
                  <>
                    {renderSectionPreview('Career Objective', [resumeData.careerObjective], (_, i) => (
                      <p key={i} style={{ fontSize: '10pt' }}>{resumeData.careerObjective}</p>
                    ), { boldHeader: false })}
                    {renderSectionPreview('Experience', resumeData.experience, (exp, i) => (
                      <div key={i} style={{ marginBottom: '8px' }}>
                        <strong style={{ fontSize: '11pt' }}>{exp.title}</strong>
                        <p style={{ fontSize: '10pt', color: '#4b5563' }}>{exp.company} | {exp.duration}</p>
                      </div>
                    ), { boldHeader: false })}
                    {renderSectionPreview('Education', resumeData.education, (edu, i) => (
                      <div key={i} style={{ marginBottom: '8px' }}>
                        <strong style={{ fontSize: '11pt' }}>{edu.degree}</strong>
                        <p style={{ fontSize: '10pt', color: '#4b5563' }}>{edu.institution} | {edu.year}</p>
                      </div>
                    ), { boldHeader: false })}
                    {renderSectionPreview('Skills', resumeData.skills, (skill, i) => (
                      <p key={i} style={{ fontSize: '10pt', paddingLeft: '15px', marginBottom: '8px' }}>
                        • {skill.name}{skill.description ? `: ${skill.description}` : ''}
                      </p>
                    ), { boldHeader: false, paddingLeft: '15px' })}
                    {renderSectionPreview('Projects', resumeData.projects, (proj, i) => (
                      <div key={i} style={{ marginBottom: '8px' }}>
                        <strong style={{ fontSize: '11pt' }}>{proj.title}</strong>
                        <p style={{ fontSize: '10pt' }}>{proj.description}</p>
                      </div>
                    ), { boldHeader: false })}
                    {renderSectionPreview('Certifications', resumeData.certifications, (cert, i) => (
                      <p key={i} style={{ fontSize: '10pt', paddingLeft: '15px', marginBottom: '8px' }}>
                        • {cert.title} ({cert.issuer}, {cert.year})
                      </p>
                    ), { boldHeader: false, paddingLeft: '15px' })}
                    {renderSectionPreview('Achievements', resumeData.achievements, (ach, i) => (
                      <div key={i} style={{ marginBottom: '8px' }}>
                        <strong style={{ fontSize: '11pt' }}>{ach.title}</strong>
                        <p style={{ fontSize: '10pt' }}>{ach.description}</p>
                      </div>
                    ), { boldHeader: false })}
                  </>
                )}
              </div>
              <style jsx>{`
                                      ::-webkit-scrollbar {
                                        width: 6px;
                                      }
                                      ::-webkit-scrollbar-track {
                                        background: #f1f1f1;
                                      }
                                      ::-webkit-scrollbar-thumb {
                                        background: #888;
                                        border-radius: 3px;
                                      }
                                      ::-webkit-scrollbar-thumb:hover {
                                        background: #555;
                                      }
                                    `}</style>
            </div>
          </div>
          <style jsx>{`
                                  ::-webkit-scrollbar {
                                    width: 6px;
                                  }
                                  ::-webkit-scrollbar-track {
                                    background: #1f2937;
                                  }
                                  ::-webkit-scrollbar-thumb {
                                    background: #4b5563;
                                    border-radius: 3px;
                                  }
                                  ::-webkit-scrollbar-thumb:hover {
                                    background: #6b7280;
                                  }
                                `}</style>
        </div>
      </div>
    );
  };

  return (
    <div>
      {selectedTemplate ? renderResumeBuilder() : renderTemplateSelection()}
    </div>
  );
}

export default Resume;