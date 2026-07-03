import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ProfileSummaryCard = ({ profile, onEditProfile }) => {
  const completionPercentage = profile?.completionPercentage || 0;

  return (
    <div className="bg-[var(--color-brand-green-dark)] rounded-lg p-6 md:p-8 text-white">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 mb-6">
        <div className="relative">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-white/20">
            <Image 
              src={profile?.avatar} 
              alt={profile?.avatarAlt}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
            <Icon name="Check" size={14} color="white" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h2 className="text-xl md:text-2xl font-bold mb-1">{profile?.name}</h2>
          <p className="text-white/80 text-sm md:text-base mb-2">{profile?.email}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm">
            <span className="flex items-center gap-1">
              <Icon name="Phone" size={14} />
              {profile?.phone}
            </span>
            <span className="flex items-center gap-1">
              <Icon name="MapPin" size={14} />
              {profile?.location}
            </span>
          </div>
        </div>

        <Button 
          variant="outline" 
          className="bg-white/10 border-white/30 text-white hover:bg-white/20"
          iconName="Edit"
          iconPosition="left"
          onClick={onEditProfile}
        >
          Edit Profile
        </Button>
      </div>
      <div className="bg-white/10 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Profile Completion</span>
          <span className="text-sm font-bold">{completionPercentage}%</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2">
          <div 
            className="bg-white h-2 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        {completionPercentage < 100 && (
          <p className="text-xs text-white/70 mt-2">
            Complete your profile to improve loan approval chances
          </p>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-6">
        <div className="bg-white/10 rounded-lg p-3 text-center">
          <p className="text-2xl md:text-3xl font-bold mb-1">{profile?.activeApplications}</p>
          <p className="text-xs text-white/70">Active Applications</p>
        </div>
        <div className="bg-white/10 rounded-lg p-3 text-center">
          <p className="text-2xl md:text-3xl font-bold mb-1">{profile?.documentsUploaded}</p>
          <p className="text-xs text-white/70">Documents Uploaded</p>
        </div>
        <div className="bg-white/10 rounded-lg p-3 text-center">
          <p className="text-2xl md:text-3xl font-bold mb-1">{profile?.creditScore}</p>
          <p className="text-xs text-white/70">Credit Score</p>
        </div>
        <div className="bg-white/10 rounded-lg p-3 text-center">
          <p className="text-2xl md:text-3xl font-bold mb-1">{profile?.memberSince}</p>
          <p className="text-xs text-white/70">Member Since</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileSummaryCard;