
import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../../components/Footer';

const About = (props) => {
  const courses = [
    {
      title: 'AI & Machine Learning',
      description: 'Master the fundamentals of AI, deep learning, and neural networks with hands-on projects',
      icon: '🤖',
      features: ['Neural Networks', 'Computer Vision', 'NLP', 'Deep Learning'],
    },
    {
      title: 'Robotics Engineering',
      description: 'Build and program robots while learning advanced automation principles',
      icon: '🦾',
      features: ['Robot Programming', 'Sensor Integration', 'Control Systems', 'IoT'],
    },
    {
      title: 'Full Stack Development',
      description: 'Become a complete developer with both frontend and backend expertise',
      icon: '💻',
      features: ['MERN Stack', 'Cloud Deploy', 'API Design', 'Database'],
    },
    {
      title: 'Cloud Technologies',
      description: 'Master cloud platforms and deploy scalable applications',
      icon: '☁️',
      features: ['AWS', 'Azure', 'DevOps', 'Microservices'],
    },
  ];

  const team = [
    {
      name: 'Alex Morgan',
      role: 'Founder & AI Lead',
      image: '/api/placeholder/150/150',
      expertise: '15+ years in AI',
    },
    {
      name: 'Sarah Chen',
      role: 'CTO & Robotics Expert',
      image: '/api/placeholder/150/150',
      expertise: 'Ph.D. in Robotics',
    },
    {
      name: 'Raj Patel',
      role: 'Lead Full Stack Developer',
      image: '/api/placeholder/150/150',
      expertise: 'Senior Architect',
    },
    {
      name: 'Maria Garcia',
      role: 'Cloud Solutions Director',
      image: '/api/placeholder/150/150',
      expertise: 'AWS Champion',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero Section */}
      <div className="py-10 sm:py-20 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#2a004730,transparent)] animate-pulse"></div>
        <div className="container mx-auto px-4 sm:px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Start Your Tech Journey Today
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 mb-8 sm:mb-12">
              Join our community of learners and innovators. Get hands-on experience with cutting-edge technologies and launch your career in tech.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/courses" className="cursor-pointer">
                <button className="px-6 py-3 sm:px-8 sm:py-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105">
                  Explore Courses →
                </button>
              </Link>
              <Link to="/" className="cursor-pointer">
                <button className="px-6 py-3 sm:px-8 sm:py-4 rounded-lg border border-blue-800/50 hover:bg-blue-900/50 transition-all transform hover:scale-105">
                  View Success Stories
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <hr className="mx-[70px] border-[3px] hidden sm:block" />

      {/* Courses Section */}
      <div className="py-10 sm:py-20 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#2a004730,transparent)] animate-pulse"></div>
        <div className="container mx-auto px-4 sm:px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-10 sm:mb-16 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Advanced Tech Programs
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {courses.map((course, index) => (
              <div
                key={index}
                className="p-4 sm:p-6 rounded-xl bg-gray-900/50 border border-blue-800/30 hover:border-blue-600/50 transition-all"
              >
                <div className="text-4xl sm:text-5xl mb-4 sm:mb-6">{course.icon}</div>
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {course.title}
                </h3>
                <p className="text-gray-300 mb-3 sm:mb-4 text-sm sm:text-base">{course.description}</p>
                <div className="flex flex-wrap gap-2">
                  {course.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 sm:px-3 py-1 rounded-full bg-blue-900/30 border border-blue-800/50"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>


      <Footer {...props}/>
    </div>
  );
};

export default About;