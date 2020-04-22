export const getTimers = () => {
    const timeBeforeLock = parseInt(process.env.TIME_BEFORE_LOCK || '0', 10);
    const timeBeforeGameLaunch = parseInt(
        process.env.TIME_BEFORE_LAUNCH || '0',
        10
    );
    const timeToAnswer = parseInt(process.env.TIME_TO_ANSWER || '0', 10);
    const timeToDisplayAnswers = parseInt(
        process.env.TIME_TO_DISPLAY_ANSWERS || '0',
        10
    );

    return {
        timeBeforeLock,
        timeBeforeGameLaunch,
        timeToAnswer,
        timeToDisplayAnswers
    };
};
