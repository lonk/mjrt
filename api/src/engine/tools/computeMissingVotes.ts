import { Player, ChosenAnswer } from '../../player';

export const computeMissingVotes = (playersById: Map<string, Player>) => {
    const players = Array.from(playersById.values());

    return players.reduce(
        (acc, player) =>
            player.answer === ChosenAnswer.Answered ||
            player.offline ||
            player.lives === 0
                ? acc - 1
                : acc,
        players.length
    );
};
