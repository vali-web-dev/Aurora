'use client';

import { useState } from 'react';
import { Card } from '@/components/aurora/Card';
import { Button } from '@/components/aurora/Button';
import { StatCard } from '@/components/aurora/StatCard';
import { Surface, SurfaceHeader, SurfaceSection } from '@/components/aurora/Surface';
import { CourseCard } from '@/components/learning/CourseCard';
import { mockCourses, mockCourseProgress } from '@/data/types';

const progressByCourseId = new Map(
  mockCourseProgress.map((entry) => [entry.courseId, entry.progress])
);

const getProgress = (courseId: string) => progressByCourseId.get(courseId) ?? 0;

export function LearningUniverse() {
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

  const filteredCourses =
    selectedLevel === 'all'
      ? mockCourses
      : mockCourses.filter((course) => course.level === selectedLevel);

  const enrolledCount = mockCourses.filter((c) => getProgress(c.id) > 0).length;
  const totalHours = mockCourses.reduce((sum, c) => sum + c.durationHours, 0);

  return (
    <Surface className="py-8">
      <SurfaceHeader
        title="Learning Universe"
        description="Learn anything. Master everything. World-class education in one place."
      />

      <SurfaceSection title="Progress Snapshot">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Enrolled Courses" value={enrolledCount} />
          <StatCard label="Total Available Hours" value={`${totalHours}h`} />
          <StatCard label="Course Library" value={mockCourses.length} />
        </div>
      </SurfaceSection>

      <SurfaceSection title="Browse Courses" description="Filter by level to find the right path.">
        <div className="flex gap-2 flex-wrap">
          {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((level) => (
            <Button
              key={level}
              variant={selectedLevel === level ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSelectedLevel(level)}
            >
              {level === 'all' ? 'All Levels' : level.charAt(0).toUpperCase() + level.slice(1)}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              id={course.id}
              title={course.title}
              description={course.description}
              level={course.level}
              duration={course.durationHours}
              lessons={course.lessonsCount}
              progress={getProgress(course.id)}
              onEnroll={() => {}}
            />
          ))}
        </div>
      </SurfaceSection>

      <SurfaceSection title="Recommended Learning Path">
        <Card>
          <div className="space-y-4">
            <div className="space-y-3">
              {[
                { step: 1, title: 'Web Design Fundamentals', icon: '🎨' },
                { step: 2, title: 'TypeScript for Professionals', icon: '⚙️' },
                { step: 3, title: 'Advanced React Patterns', icon: '⚛️' },
                { step: 4, title: 'System Design at Scale', icon: '🏗️' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="text-2xl">{item.icon}</div>
                  <div className="flex-grow">
                    <p className="aurora-label text-slate-900 dark:text-slate-50">
                      Step {item.step}: {item.title}
                    </p>
                  </div>
                  <div className="aurora-label text-2xl text-slate-400">→</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </SurfaceSection>

      <SurfaceSection title="Integrated Platforms">
        <Card>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Udemy', 'Coursera', 'Khan Academy', 'Skillshare', 'LinkedIn Learning', 'YouTube', 'Codecademy', 'Pluralsight'].map(
                (platform) => (
                  <div
                    key={platform}
                    className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-center font-medium aurora-label text-slate-900 dark:text-slate-50"
                  >
                    {platform}
                  </div>
                )
              )}
            </div>
          </div>
        </Card>
      </SurfaceSection>
    </Surface>
  );
}
