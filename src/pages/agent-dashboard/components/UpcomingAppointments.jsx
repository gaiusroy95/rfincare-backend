import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const UpcomingAppointments = ({ appointments, onMessage }) => {
  const getAppointmentTypeColor = (type) => {
    const colors = {
      consultation: 'bg-blue-100 text-blue-700 border-blue-200',
      'document-review': 'bg-purple-100 text-purple-700 border-purple-200',
      'follow-up': 'bg-green-100 text-green-700 border-green-200',
      meeting: 'bg-amber-100 text-amber-700 border-amber-200'
    };
    return colors?.[type] || colors?.meeting;
  };

  const getAppointmentIcon = (type) => {
    const icons = {
      consultation: 'MessageSquare',
      'document-review': 'FileText',
      'follow-up': 'Phone',
      meeting: 'Video'
    };
    return icons?.[type] || 'Calendar';
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center space-x-2">
          <Icon name="Calendar" size={20} color="var(--color-primary)" />
          <h2 className="text-lg md:text-xl font-bold text-foreground">Upcoming Appointments</h2>
        </div>
        <Button variant="outline" size="sm" iconName="Plus">
          Schedule
        </Button>
      </div>
      <div className="space-y-3">
        {appointments?.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="CalendarX" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No upcoming appointments</p>
            <Button variant="outline" size="sm" className="mt-4" iconName="Plus">
              Schedule Appointment
            </Button>
          </div>
        ) : (
          appointments?.map((appointment) => (
            <div
              key={appointment?.id}
              className="flex items-start space-x-3 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
            >
              <div className="flex-shrink-0">
                <Image
                  src={appointment?.clientAvatar}
                  alt={appointment?.clientAvatarAlt}
                  className="w-12 h-12 rounded-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground truncate">{appointment?.clientName}</h3>
                    <p className="text-xs text-muted-foreground">{appointment?.title}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full border ${getAppointmentTypeColor(appointment?.type)} flex-shrink-0 ml-2`}>
                    {appointment?.type?.split('-')?.map(word => word?.charAt(0)?.toUpperCase() + word?.slice(1))?.join(' ')}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Icon name="Clock" size={12} />
                    <span>{appointment?.time}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Icon name="Calendar" size={12} />
                    <span>{appointment?.date}</span>
                  </div>
                  {appointment?.location && (
                    <div className="flex items-center space-x-1">
                      <Icon name={getAppointmentIcon(appointment?.type)} size={12} />
                      <span className="truncate">{appointment?.location}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 mt-3">
                  <Button variant="outline" size="xs" iconName="Phone">
                    Call
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    iconName="MessageSquare"
                    onClick={() => onMessage?.(appointment)}
                  >
                    Message
                  </Button>
                  <Button variant="ghost" size="xs" iconName="MoreHorizontal" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UpcomingAppointments;