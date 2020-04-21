import { Player } from '../../player';

export const findNewRoomMaster = (playersById: Map<string, Player>) => {
    const players = Array.from(playersById.values());
    let firstPlayerOnline: Player | null = null;
    let currentRoomMaster: Player | null = null;
    for (const player of players) {
        if (!player.offline && !firstPlayerOnline) {
            firstPlayerOnline = player;
        }

        if (player.isRoomMaster && !player.offline) {
            currentRoomMaster = player;
        }
    }

    return currentRoomMaster || firstPlayerOnline;
};
