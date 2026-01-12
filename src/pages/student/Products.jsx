
import React from 'react';
import Footer from '../../components/Footer';

const Products = (props) => {
  const products = [
    {
      category: 'AI-Powered Development',
      items: [
        {
          title: 'Full-Stack Web Apps',
          description: 'Craft scalable, secure web applications with AI automation for rapid deployment.',
          features: ['MERN Stack Automation', 'Real-Time Deployment', 'SEO Optimization', 'Custom UI/UX'],
          icon: '💻'
        },
        {
          title: 'Mobile Apps (Android & iOS)',
          description: 'Develop high-performance apps for Android and iOS with AI-driven efficiency.',
          features: ['Native Performance', 'AI Code Generation', 'App Store Ready', 'Push Notifications'],
          icon: '📱'
        }
      ]
    },
    {
      category: 'AI-Powered Solutions',
      items: [
        {
          title: 'Intelligent App Suite',
          description: 'Launch smart apps with AI for automation, analytics, and enhanced user experiences.',
          features: ['Predictive Analytics', 'Chatbot Integration', 'Voice Recognition', 'Personalization'],
          icon: '🤖'
        },
        {
          title: 'Cloud Optimization',
          description: 'Optimize cloud infrastructure with AI for scalability and cost efficiency.',
          features: ['Auto-Scaling', 'Cloud Migration', 'Security Automation', 'Resource Monitoring'],
          icon: '☁️'
        }
      ]
    },
    {
      category: 'Training & Upskilling',
      items: [
        {
          title: 'AI Development Bootcamp',
          description: 'Master AI-driven development with expert-led, hands-on training.',
          features: ['Live Projects', 'Certification', 'Mentorship', 'Job Placement Support'],
          icon: '📚'
        },
        {
          title: 'Cloud Mastery Program',
          description: 'Gain expertise in cloud architecture with AI-enhanced training.',
          features: ['AWS & Azure Skills', 'Practical Labs', 'Expert-Led Sessions', 'Lifetime Access'],
          icon: '🚀'
        }
      ]
    }
  ];

  const keyBenefits = [
    {
      title: 'Lightning-Fast Development',
      description: 'Slash development time with AI automation, delivering apps in record time.',
      icon: '⚡'
    },
    {
      title: 'Future-Proof Scalability',
      description: 'Scale effortlessly with AI-optimized cloud and app solutions.',
      icon: '📈'
    },
    {
      title: 'Next-Gen Innovation',
      description: 'Embed cutting-edge AI into every project for smarter outcomes.',
      icon: '💡'
    },
    {
      title: 'Empowered Growth',
      description: 'Unlock your potential with expert training and ongoing support.',
      icon: '🤝'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="py-6 sm:py-10 relative">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-block px-4 py-1 sm:px-6 sm:py-2 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-800/50 text-xs sm:text-sm font-semibold backdrop-blur-sm mb-3 sm:mb-4 md:mb-6">
            🌟 AI-Powered Excellence
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold mb-3 sm:mb-4 md:mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-500 bg-clip-text text-transparent drop-shadow-lg">
            Unleash AI Innovation
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Revolutionize your projects with AI-driven web, mobile, and cloud solutions, plus world-class training to supercharge your skills.
          </p>
        </div>
      </div>
      <hr className="mx-[70px] border-[3px] hidden sm:block" />

      <div className="py-10 sm:py-16 md:py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/20 to-blue-950/20"></div>
        <div className="container mx-auto px-4">
          {products.map((category, index) => (
            <div key={index} className="mb-10 sm:mb-16 md:mb-20 last:mb-0">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-8 md:mb-12 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent text-center md:text-left">
                {category.category}
              </h2>
              <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                {category.items.map((product, productIndex) => (
                  <div
                    key={productIndex}
                    className="p-4 sm:p-6 rounded-xl bg-gray-900/70 border border-blue-800/40 hover:border-blue-600/60 hover:bg-gray-900/80 transition-all duration-300 shadow-lg hover:shadow-blue-500/20"
                  >
                    <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 transform hover:scale-110 transition-transform duration-200">{product.icon}</div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      {product.title}
                    </h3>
                    <p className="text-gray-300 mb-3 sm:mb-4 text-sm md:text-base">{product.description}</p>
                    <ul className="space-y-1 sm:space-y-2">
                      {product.features.map((feature, fIndex) => (
                        <li key={fIndex} className="flex items-center text-gray-300 text-xs sm:text-sm">
                          <span className="mr-2 text-blue-400">✔️</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="py-10 sm:py-16 md:py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/20 to-blue-950/20"></div>
        <div className="container mx-auto px-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-8 md:mb-12 text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Why Choose Us?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {keyBenefits.map((benefit, index) => (
              <div
                key={index}
                className="p-4 sm:p-6 rounded-xl bg-gray-900/70 border border-blue-800/40 hover:border-blue-600/60 hover:bg-gray-900/80 transition-all duration-300 shadow-lg hover:shadow-purple-500/20"
              >
                <div className="text-2xl sm:text-3xl mb-3 sm:mb-4 transform hover:scale-110 transition-transform duration-200">{benefit.icon}</div>
                <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {benefit.title}
                </h3>
                <p className="text-gray-300 text-xs sm:text-sm md:text-base">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer {...props}/>
    </div>
  );
};

export default Products;