import Shop from '../models/Shop';

export const getOne = async (
    serverId: string,
    roleId: string
): Promise<Shop | null> =>
    Shop.findOne({
        where: { serverId, roleId },
    });

export const getAll = async (serverId: string): Promise<Shop[]> =>
    Shop.findAll({
        where: { serverId },
    });

export const add = async (
    serverId: string,
    roleId: string,
    cost = 0
): Promise<Shop> => {
    const role = await getOne(serverId, roleId);

    if (role == undefined) {
        return Shop.create({
            serverId,
            roleId,
            cost,
        });
    }

    return role.update({
        cost,
    });
};

export const remove = async (
    serverId: string,
    roleId: string
): Promise<void> => {
    const role = await getOne(serverId, roleId);
    if (role) {
        return role.destroy();
    }
};
