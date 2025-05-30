import React from 'react';

// Updated team members
const teamMembers = [
  {
    id: 1,
    name: 'Taimour Sultan',
    role: 'Front-end Developer',
    department: '216228 | UOS216022028 | Software Engineering',
    techstack: ['React', 'JavaScript', 'HTML', 'CSS'],
    imageUrl: 'taimor.jpg',
    socials: {
      linkedin: '#',
      twitter: '#',
      github: '#',
    },
  },
  {
    id: 2,
    name: 'Faraz Sultan',
    role: 'Back-end Developer',
    department: '216237 | UOS216022037 | Software Engineering',
    techstack: ['Python', 'PostgreSQL', 'Flask', 'Machine Learning'],
    imageUrl: 'faraz.jpg',
    socials: {
      linkedin: '#',
      github: '#',
    },
  },
];

const Team = () => {
  return (
    <section id="team" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Meet Our Dedicated Team
          </h2>
          <p className="text-lg text-slate-700 font-medium">
            The Minds Behind the Innovation
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 justify-items-center">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-xl shadow-xl overflow-hidden transform transition duration-500 hover:scale-105 hover:shadow-2xl flex flex-col"
            >
              {/* Modified image container to ensure faces are visible */}
              <div className="relative h-72 w-full overflow-hidden">
                <img
                  src={member.imageUrl}
                  alt={member.name}
                  className="absolute w-full h-full object-cover object-top"
                  // Added object-top to focus on the upper part of the image where faces typically are
                />
              </div>
              <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-2xl font-semibold text-slate-900 mb-1">
                  {member.name}
                </h3>
                <p className="text-slate-700 font-medium mb-1">{member.role}</p>
                <p className="text-gray-500 text-sm mb-3">{member.department}</p>
                
                {member.techstack && member.techstack.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs text-slate-800 font-semibold mb-1 uppercase tracking-wider">Tech Stack:</h4>
                    <div className="flex flex-wrap gap-2">
                      {member.techstack.map((tech, index) => (
                        <span key={index} className="bg-slate-100 text-slate-800 text-xs px-2 py-1 rounded-full">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <p className="text-gray-700 text-sm leading-relaxed mb-4 flex-grow">
                  {member.description || 'No description available.'}
                </p>

                {member.socials && (
                  <div className="mt-auto pt-3 border-t border-gray-200">
                    <div className="flex space-x-3 justify-center">
                      {member.socials.linkedin && <a href={member.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-slate-900 transition-colors"><i className="fab fa-linkedin fa-lg"></i></a>}
                      {member.socials.twitter && <a href={member.socials.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-slate-800 transition-colors"><i className="fab fa-twitter fa-lg"></i></a>}
                      {member.socials.github && <a href={member.socials.github} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-800 transition-colors"><i className="fab fa-github fa-lg"></i></a>}
                      {member.socials.portfolio && <a href={member.socials.portfolio} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-slate-900 transition-colors"><i className="fas fa-globe fa-lg"></i></a>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;