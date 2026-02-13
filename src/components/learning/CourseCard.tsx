import { Card } from '@/components/aurora/Card';
import { Button } from '@/components/aurora/Button';

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  lessons: number;
  progress: number;
  onEnroll: () => void;
}

export function CourseCard({
  id,
  title,
  description,
  level,
  duration,
  lessons,
  progress,
  onEnroll,
}: CourseCardProps) {
  const levelColors = {
    beginner: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
    intermediate: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
    advanced: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
  };

  return (
    <Card hoverable className="flex flex-col h-full">
      <div className="h-32 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg mb-4 flex items-center justify-center">
        <div className="text-5xl">📚</div>
      </div>

      <div className="flex-grow space-y-3">
        <div>
          <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-50 mb-1">
            {title}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
            {description}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${levelColors[level]}`}>
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </span>
          <span className="text-xs text-slate-600 dark:text-slate-400">
            {duration}h • {lessons} lessons
          </span>
        </div>

        {progress > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <Button
        variant={progress > 0 ? 'secondary' : 'primary'}
        size="sm"
        onClick={onEnroll}
        className="w-full mt-4"
      >
        {progress > 0 ? 'Continue Learning' : 'Enroll Now'}
      </Button>
    </Card>
  );
}
