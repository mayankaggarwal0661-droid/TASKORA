import { Task } from '@/types/task';
import { FocusSession } from '@/types/focus';
import { Routine } from '@/types/routine';

export interface GardenPlant {
  id: string;
  name: string;
  species: string;
  potType: string;
  stage: 'sprout' | 'growing' | 'blooming' | 'mature';
  growthProgressPercent: number; // 0 to 100
  metricLabel: string;
  metricValue: string;
  description: string;
}

export interface GardenState {
  level: number;
  levelTitle: string;
  totalGrowthPoints: number;
  completedTasksCount: number;
  focusMinutesTotal: number;
  activeStreaksTotal: number;
  plants: GardenPlant[];
  ambientState: {
    sunIntensity: number; // 0 to 1
    dewDropsCount: number;
    butterfliesCount: number;
    growthMessage: string;
  };
}

export class GardenService {
  /**
   * Derive garden growth strictly from recorded tasks, focus sessions, and routines.
   * Growth is permanent: missed days never decrease points or wither plants.
   */
  public static calculateGarden(
    tasks: Task[],
    focusSessions: FocusSession[],
    routines: Routine[]
  ): GardenState {
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const completedTasksCount = completedTasks.length;

    const focusMinutesTotal = Math.round(
      focusSessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0) / 60
    );

    const activeStreaksTotal = routines.reduce(
      (acc, r) => acc + (r.currentStreak || 0),
      0
    );

    // Calculate Growth Points:
    // 25 pts per completed task, 1 pt per focus minute, 10 pts per routine streak day
    const taskPoints = completedTasksCount * 25;
    const focusPoints = focusMinutesTotal;
    const routinePoints = activeStreaksTotal * 10;
    const totalGrowthPoints = taskPoints + focusPoints + routinePoints;

    // Garden Levels
    let level = 1;
    let levelTitle = 'Seedling Sanctuary';
    if (totalGrowthPoints >= 800) {
      level = 4;
      levelTitle = 'Lush Botanical Arboretum';
    } else if (totalGrowthPoints >= 400) {
      level = 3;
      levelTitle = 'Blooming Terracotta Haven';
    } else if (totalGrowthPoints >= 150) {
      level = 2;
      levelTitle = 'Flourishing Herb Garden';
    }

    // Plant 1: Sage Bush (driven by completed tasks)
    // Needs 10 tasks to reach 100% mature
    const sageProgress = Math.min(100, Math.round((completedTasksCount / 10) * 100));
    let sageStage: GardenPlant['stage'] = 'sprout';
    if (sageProgress >= 85) sageStage = 'mature';
    else if (sageProgress >= 50) sageStage = 'blooming';
    else if (sageProgress >= 20) sageStage = 'growing';

    // Plant 2: Terracotta Olive Bonsai (driven by focus minutes)
    // Needs 120 minutes of focus to reach 100%
    const oliveProgress = Math.min(100, Math.round((focusMinutesTotal / 120) * 100));
    let oliveStage: GardenPlant['stage'] = 'sprout';
    if (oliveProgress >= 85) oliveStage = 'mature';
    else if (oliveProgress >= 50) oliveStage = 'blooming';
    else if (oliveProgress >= 20) oliveStage = 'growing';

    // Plant 3: Desert Clay Blossom (driven by routine streaks)
    // Needs 15 cumulative streak days to reach 100%
    const blossomProgress = Math.min(100, Math.round((activeStreaksTotal / 15) * 100));
    let blossomStage: GardenPlant['stage'] = 'sprout';
    if (blossomProgress >= 85) blossomStage = 'mature';
    else if (blossomProgress >= 50) blossomStage = 'blooming';
    else if (blossomProgress >= 20) blossomStage = 'growing';

    const plants: GardenPlant[] = [
      {
        id: 'plant-sage',
        name: 'Sweet Meadow Sage',
        species: 'Salvia Officinalis',
        potType: 'Warm Taupe Stoneware',
        stage: sageStage,
        growthProgressPercent: sageProgress,
        metricLabel: 'Completed Tasks',
        metricValue: `${completedTasksCount} / 10 delivered`,
        description: 'Thrives on direct execution. Each completed task nurtures aromatic silver-green foliage.',
      },
      {
        id: 'plant-olive',
        name: 'Heritage Olive Bonsai',
        species: 'Olea Europaea',
        potType: 'Terracotta Clay Pot',
        stage: oliveStage,
        growthProgressPercent: oliveProgress,
        metricLabel: 'Deep Focus Logged',
        metricValue: `${focusMinutesTotal} / 120 mins`,
        description: 'Rooted in sustained attention. Every uninterrupted Pomodoro hour strengthens the woody trunk.',
      },
      {
        id: 'plant-blossom',
        name: 'Golden Desert Bloom',
        species: 'Adenium Obesum',
        potType: 'Glazed Sienna Vessel',
        stage: blossomStage,
        growthProgressPercent: blossomProgress,
        metricLabel: 'Habit Consistency',
        metricValue: `${activeStreaksTotal} / 15 streak days`,
        description: 'Blooms through rhythm and ritual. Regular routine check-ins reveal delicate warm amber blossoms.',
      },
    ];

    const sunIntensity = Math.min(1, 0.4 + (totalGrowthPoints / 1000) * 0.6);
    const dewDropsCount = Math.min(8, Math.floor(completedTasksCount / 2));
    const butterfliesCount = Math.min(5, Math.floor(activeStreaksTotal / 5));

    let growthMessage = 'Your botanical sanctuary is taking root. Completed tasks and focus blocks provide steady nourishment.';
    if (level >= 3) {
      growthMessage = 'Thriving momentum! Your focus sessions and habits have created a lush, tranquil oasis.';
    }

    return {
      level,
      levelTitle,
      totalGrowthPoints,
      completedTasksCount,
      focusMinutesTotal,
      activeStreaksTotal,
      plants,
      ambientState: {
        sunIntensity,
        dewDropsCount,
        butterfliesCount,
        growthMessage,
      },
    };
  }
}
