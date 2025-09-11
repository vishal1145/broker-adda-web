"use client";
import React, { useState } from "react";
import teamData from "../data/team.json";
import {
  FaFacebookF,
  FaTwitter,
  FaPinterestP,
  FaInstagram,
} from "react-icons/fa";

const Team = () => {
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <section className="px-6 sm:px-12 lg:px-32 py-16 bg-white text-center">
      <div className="max-w-7xl mx-auto ">
        {/* Section Heading */}
        <p className="text-xl text-gray-900 text-center mb-2">
          <span className="text-yellow-500">—</span> Our Team
        </p>
        <h2 className="text-4xl font-medium text-gray-900 mb-12 leading-tight">
          Meet <span className="text-green-800">Our Team</span>
        </h2>

        {/* Team Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {/* Team Member 1 - Jenny Alexander */}
          <div 
            className="bg-gray-50 rounded-2xl p-6 text-center shadow-sm transition-all duration-300 hover:shadow-lg"
            onMouseEnter={() => setHoveredCard(0)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="relative mb-4">
              <img
                src={teamData[0]?.image || "/images/team/jenny-alexander.jpg"}
                alt="Jenny Alexander"
                className="w-full h-64 rounded-xl"
              />
              {/* Social Media Icons Overlay */}
              {hoveredCard === 0 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 animate-fade-in">
                   <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
                  <FaFacebookF className="text-yellow-500 text-sm" />
                </div>
                </div>
                 <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
                  <FaTwitter className="text-yellow-500 text-sm" />
                </div>
                </div>
                  <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
                  <FaPinterestP className="text-yellow-500 text-sm" />
                </div>
             </div>
                   <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
                  <FaInstagram className="text-yellow-500 text-sm" />
                </div>
                </div>
                </div>
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Jenny Alexander</h3>
            <p className="text-gray-600 text-sm">[CEO, Furniture]</p>
          </div>

          {/* Team Member 2 - Robert Fox */}
          <div 
            className="bg-gray-50 rounded-2xl p-6 text-center shadow-sm transition-all duration-300 hover:shadow-lg"
            onMouseEnter={() => setHoveredCard(1)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="relative mb-4">
              <img
                src={teamData[1]?.image || "/images/team/robert-fox.jpg"}
                alt="Robert Fox"
                className="w-full h-64 rounded-xl"
              />
              {/* Social Media Icons Overlay */}
              {hoveredCard === 1 && (
                 <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 animate-fade-in">
                   <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
                  <FaFacebookF className="text-yellow-500 text-sm" />
                </div>
                </div>
                 <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
                  <FaTwitter className="text-yellow-500 text-sm" />
                </div>
                </div>
                  <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
                  <FaPinterestP className="text-yellow-500 text-sm" />
                </div>
             </div>
                   <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
                  <FaInstagram className="text-yellow-500 text-sm" />
                </div>
                </div>
                </div>
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Robert Fox</h3>
            <p className="text-gray-600 text-sm">[Carpenter]</p>
          </div>

          {/* Team Member 3 - Theresa Webb */}
          <div 
            className="bg-gray-50 rounded-2xl p-6 text-center shadow-sm transition-all duration-300 hover:shadow-lg"
            onMouseEnter={() => setHoveredCard(2)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="relative mb-4">
              <img
                src={teamData[2]?.image || "/images/team/theresa-webb.jpg"}
                alt="Theresa Webb"
                className="w-full h-64 rounded-xl"
              />
              {/* Social Media Icons Overlay */}
              {hoveredCard === 2 && (
                   <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 animate-fade-in">
                   <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
                  <FaFacebookF className="text-yellow-500 text-sm" />
                </div>
                </div>
                 <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
                  <FaTwitter className="text-yellow-500 text-sm" />
                </div>
                </div>
                  <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
                  <FaPinterestP className="text-yellow-500 text-sm" />
                </div>
             </div>
                   <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
                  <FaInstagram className="text-yellow-500 text-sm" />
                </div>
                </div>
                </div>
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Theresa Webb</h3>
            <p className="text-gray-600 text-sm">[Carpenter]</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Team;
