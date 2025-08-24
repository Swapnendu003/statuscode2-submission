'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { GithubIcon, LinkedinIcon, TwitterIcon, Users, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TeamMember {
  name: string;
  role: string;
  imageUrl: string;
  socialLinks?: { platform: 'github' | 'twitter' | 'linkedin'; url: string }[];
}

interface TeamProps {
  title?: string;
  subtitle?: string;
  members?: TeamMember[];
  className?: string;
}

// Default team members data - customized for VaniSetu
const defaultMembers: TeamMember[] = [
  {
    name: 'SAGNIK DATTA',
    role: 'ML AND GEN AI ENGINEER',
    imageUrl:
      'https://i.postimg.cc/zB2bS1F7/IMG-6199.jpg',
    socialLinks: [
      { platform: 'linkedin', url: 'https://linkedin.com' },
      { platform: 'twitter', url: 'https://twitter.com' },
      { platform: 'github', url: 'https://github.com/sagnik-datta-02' },
    ],
  },
  
  {
    name: 'ADRITA CHAKRABORTY',
    role: 'BACKEND DEVELOPER',
    imageUrl:
      'https://i.postimg.cc/cJhj1Ddw/Whats-App-Image-2025-07-15-at-11-10-47.jpg',
    socialLinks: [
      { platform: 'linkedin', url: 'https://www.linkedin.com/in/adrita-chakraborty-ba9b2a24b/' },
      { platform: 'github', url: 'https://github.com/ADRITA-art' },
    ],
  },
  {
    name: 'SWAPNENDU BANERJEE',
    role: 'FULL STACK DEVELOPER',
    imageUrl:
      'https://i.postimg.cc/W3yLw9Fg/IMG-6211.jpg',
    socialLinks: [
      { platform: 'github', url: 'https://github.com/Swapnendu003' },
      { platform: 'linkedin', url: 'https://www.linkedin.com/in/swapnendu-banerjee-36ba06219/' },
      { platform: 'twitter', url: 'https://twitter.com' },
    ],
  },
];

export default function Team2({
  title = 'Meet the VaniSetu Team',
  subtitle = "Passionate innovators working to bridge the financial inclusion gap and empower every Indian with accessible banking services.",
  members = defaultMembers,
  className,
}: TeamProps) {
  return (
    <section
      className={cn(
        'relative w-full overflow-hidden py-16 md:py-24',
        className,
      )}
    >
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <Badge
            variant="outline"
            className="mb-4 px-4 py-2 text-sm border-blue-200 text-blue-700 bg-white/80 mx-auto inline-flex items-center"
          >
            <Users className="h-4 w-4 mr-2" />
            Our Team
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            {title}
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">{subtitle}</p>
        </motion.div>

        {/* Team members grid */}
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
          {members.map((member, index) => (
            <TeamMemberCard key={member.name} member={member} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TeamMemberCard({
  member,
  index,
}: {
  member: TeamMember;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 * index }}
      viewport={{ once: true }}
      className="group relative overflow-hidden h-[420px]" // Fixed height for all cards
    >
      {/* Card with theme-consistent styling */}
      <div className="bg-white border-4 border-black shadow-[8px_8px_0_0_#000] transition-shadow duration-300 hover:shadow-[12px_12px_0_0_#000] rounded-xl overflow-hidden h-full flex flex-col">
        {/* Image container - fixed aspect ratio */}
        <div className="relative flex-shrink-0 h-[280px] overflow-hidden">
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <img
            src={member.imageUrl}
            alt={member.name}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {/* Social links that appear on hover */}
          {member.socialLinks && (
            <div className="absolute right-0 bottom-4 left-0 z-20 flex justify-center gap-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              {member.socialLinks.map((link) => (
                <Link
                  prefetch={false}
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/90 text-gray-800 hover:bg-blue-600 hover:text-white flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-sm transition-all border-2 border-black"
                >
                  {link.platform === 'github' && (
                    <GithubIcon className="h-4 w-4" />
                  )}
                  {link.platform === 'twitter' && (
                    <TwitterIcon className="h-4 w-4" />
                  )}
                  {link.platform === 'linkedin' && (
                    <LinkedinIcon className="h-4 w-4" />
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Name and role - fixed height container */}
        <div className="flex-1 p-6 text-center flex flex-col justify-center min-h-[140px]">
          <h3 className="text-lg font-bold text-gray-800 mb-2 leading-tight">
            {member.name}
          </h3>
          <p className="text-blue-600 font-medium text-sm leading-tight">
            {member.role}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
