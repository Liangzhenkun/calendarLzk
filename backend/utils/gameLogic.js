// 等级计算
const calculateLevel = (experience) => {
    // 基础经验值要求
    const baseExperience = 100;
    // 每级增加的经验值要求
    const experienceIncrement = 50;
    
    let level = 1;
    let experienceRequired = baseExperience;
    let remainingExperience = experience;

    while (remainingExperience >= experienceRequired) {
        remainingExperience -= experienceRequired;
        level++;
        experienceRequired = baseExperience + (level - 1) * experienceIncrement;
    }

    return level;
};

// 计算下一级所需经验值
const calculateNextLevelExperience = (currentLevel) => {
    const baseExperience = 100;
    const experienceIncrement = 50;
    return baseExperience + (currentLevel - 1) * experienceIncrement;
};

// 计算经验值进度
const calculateExperienceProgress = (experience) => {
    const currentLevel = calculateLevel(experience);
    const nextLevelExperience = calculateNextLevelExperience(currentLevel);
    const baseExperience = 100;
    const experienceIncrement = 50;

    // 计算当前等级的起始经验值
    let totalPreviousExperience = 0;
    for (let i = 1; i < currentLevel; i++) {
        totalPreviousExperience += baseExperience + (i - 1) * experienceIncrement;
    }

    // 计算当前等级的经验值进度
    const currentLevelExperience = experience - totalPreviousExperience;
    const progress = (currentLevelExperience / nextLevelExperience) * 100;

    return {
        currentLevel,
        nextLevelExperience,
        currentLevelExperience,
        progress: Math.min(progress, 100)
    };
};

// 计算任务奖励
const calculateTaskReward = (taskType, taskDifficulty = 'normal') => {
    const basePoints = 10;
    const baseExperience = 20;

    const difficultyMultipliers = {
        easy: 0.8,
        normal: 1,
        hard: 1.5
    };

    const typeMultipliers = {
        WORD_COUNT: 1,
        MOOD_TRACKING: 1.2,
        STREAK: 1.5,
        SPECIAL: 2
    };

    const multiplier = difficultyMultipliers[taskDifficulty] * (typeMultipliers[taskType] || 1);

    return {
        points: Math.round(basePoints * multiplier),
        experience: Math.round(baseExperience * multiplier)
    };
};

// 计算成就奖励
const calculateAchievementReward = (achievementType, tier = 1) => {
    const basePoints = 50;
    const baseExperience = 100;

    const tierMultipliers = {
        1: 1,    // 铜
        2: 2,    // 银
        3: 3,    // 金
        4: 5     // 白金
    };

    const typeMultipliers = {
        DIARY_COUNT: 1,
        STREAK_DAYS: 1.5,
        TOTAL_WORDS: 1.2,
        SPECIAL: 2
    };

    const multiplier = tierMultipliers[tier] * (typeMultipliers[achievementType] || 1);

    return {
        points: Math.round(basePoints * multiplier),
        experience: Math.round(baseExperience * multiplier)
    };
};

// 计算连续签到奖励
const calculateStreakReward = (streakDays) => {
    const basePoints = 5;
    const baseExperience = 10;

    // 连续签到天数的奖励倍数
    let multiplier = 1;
    if (streakDays >= 30) {
        multiplier = 5;
    } else if (streakDays >= 15) {
        multiplier = 3;
    } else if (streakDays >= 7) {
        multiplier = 2;
    }

    return {
        points: basePoints * multiplier,
        experience: baseExperience * multiplier
    };
};

module.exports = {
    calculateLevel,
    calculateNextLevelExperience,
    calculateExperienceProgress,
    calculateTaskReward,
    calculateAchievementReward,
    calculateStreakReward
}; 