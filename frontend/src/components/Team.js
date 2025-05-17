import React from 'react';

// Updated team members data structure
const teamMembers = [
  {
    id: 1,
    name: 'Dr. Evelyn Reed',
    role: 'Lead AI Researcher',
    department: 'Artificial Intelligence Division',
    techstack: ['Python', 'TensorFlow', 'PyTorch', 'OpenCV'],
    imageUrl: 'https://via.placeholder.com/150/A9A9A9/FFFFFF?text=Evelyn', // Replace with actual image URL
    socials: {
      linkedin: '#',
      twitter: '#',
    }
  },
  {
    id: 2,
    name: 'Marcus Chen',
    role: 'Chief Technology Officer',
    department: 'Engineering & Infrastructure',
    techstack: ['JavaScript', 'React', 'Node.js', 'AWS', 'Docker'],
    imageUrl: 'https://via.placeholder.com/150/A9A9A9/FFFFFF?text=Marcus', // Replace with actual image URL
    socials: {
      linkedin: '#',
      github: '#',
    }
  },
  {
    id: 3,
    name: 'Aisha Khan',
    role: 'Head of Product Development',
    department: 'Product & UX',
    techstack: ['Agile', 'JIRA', 'Figma', 'User Research'],
    imageUrl: 'https://via.placeholder.com/150/A9A9A9/FFFFFF?text=Aisha', // Replace with actual image URL
    socials: {
      linkedin: '#',
      portfolio: '#',
    }
  },
];

const Team = () => {
  return (
    <section id="team" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-purple-700 mb-4">
            Meet Our Dedicated Team
          </h2>
          <p className="text-lg text-pink-600 font-medium">
            The Minds Behind the Innovation
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-xl shadow-xl overflow-hidden transform transition duration-500 hover:scale-105 hover:shadow-2xl flex flex-col"
            >
              <img
                src={member.imageUrl}
                alt={member.name}
                className="w-full h-64 object-cover object-center"
              />
              <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-2xl font-semibold text-purple-700 mb-1">
                  {member.name}
                </h3>
                <p className="text-pink-600 font-medium mb-1">{member.role}</p>
                <p className="text-gray-500 text-sm mb-3">{member.department}</p>
                
                {member.techstack && member.techstack.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs text-purple-700 font-semibold mb-1 uppercase tracking-wider">Tech Stack:</h4>
                    <div className="flex flex-wrap gap-2">
                      {member.techstack.map((tech, index) => (
                        <span key={index} className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <p className="text-gray-700 text-sm leading-relaxed mb-4 flex-grow">
                  {/* You can add a short description here if you still want one, 
                      or remove this if role, department, and tech stack are sufficient.
                      Example: member.description 
                  */}
                </p>

                {member.socials && (
                  <div className="mt-auto pt-3 border-t border-gray-200">
                    <div className="flex space-x-3 justify-center">
                      {member.socials.linkedin && <a href={member.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-purple-600 transition-colors"><i className="fab fa-linkedin fa-lg"></i></a>}
                      {member.socials.twitter && <a href={member.socials.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-pink-600 transition-colors"><i className="fab fa-twitter fa-lg"></i></a>}
                      {member.socials.github && <a href={member.socials.github} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-800 transition-colors"><i className="fab fa-github fa-lg"></i></a>}
                      {member.socials.portfolio && <a href={member.socials.portfolio} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-purple-600 transition-colors"><i className="fas fa-globe fa-lg"></i></a>}
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