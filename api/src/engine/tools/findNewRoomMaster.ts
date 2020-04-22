import { Player } from '../../player';

export const findNewRoomMaster = (playersById: Map<string, Player>) => {
    const players = Array.from(playersById.values());
    let firstAvailablePlayer: Player | null = null;
    let currentRoomMaster: Player | null = null;
    for (const player of players) {
        if (!player.offline && !firstAvailablePlayer) {
            firstAvailablePlayer = player;
        }

        if (player.isRoomMaster) {
            currentRoomMaster = player;
        }
    }

    const newRoomMaster = currentRoomMaster && !currentRoomMaster.offline ?
        currentRoomMaster :
        firstAvailablePlayer;

    return {
        currentRoomMaster,
        newRoomMaster
    };
};
