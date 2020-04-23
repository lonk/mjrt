import { Player, ChosenAnswer } from '../../player';

const getWinningAnswers = (players: Player[]) => {
    const answersScores: Map<ChosenAnswer, number> = new Map();

    for (const player of players) {
        if (player.hiddenAnswer == null) {
            continue;
        }

        const currentAnswerScore = answersScores.get(player.hiddenAnswer) || 0;
        answersScores.set(player.hiddenAnswer, currentAnswerScore + 1);
    }

    let max = 0;
    const winningAnswers = Array.from(answersScores.entries()).reduce(
        (winners, [key, amount]) => {
            if (amount > max) {
                max = amount;
                return [key];
            } else if (amount === max) {
                return [...winners, key];
            }

            return winners;
        },
        [] as ChosenAnswer[]
    );

    return winningAnswers;
};

export const computePlayersAlive = (playersById: Map<string, Player>) => {
    const players = Array.from(playersById.values());
    const winningAnswers = getWinningAnswers(players);
    const updatedPlayersById: Map<string, Player> = new Map();
    let playersAlive = 0;

    for (const player of players) {
        let lives = player.lives;
        if (
            player.hiddenAnswer === null ||
            winningAnswers.indexOf(player.hiddenAnswer) === -1
        ) {
            lives = Math.max(lives - 1, 0);
        }

        updatedPlayersById.set(player.id, {
            ...player,
            lives,
            answer: player.hiddenAnswer
        });

        if (lives > 0) {
            playersAlive += 1;
        }
    }

    return {
        updatedPlayersById,
        winningAnswers,
        playersAlive
    };
};
