import Var from '../models/Var';

export const getAll = async (key: string): Promise<Var[]> =>
    Var.findAll({
        where: { key },
    });

export const getOne = async (
    serverId: string,
    key: string
): Promise<Var | null> =>
    Var.findOne({
        where: { key, serverId },
    });

export const set = async (
    serverId: string,
    key: string,
    value: string
): Promise<Var> => {
    const variable = await getOne(serverId, key);

    if (variable != null) {
        return variable.update({ value });
    }

    return Var.create({ serverId, key, value });
};

export const remove = async (serverId: string, key: string): Promise<void> => {
    const variable = await getOne(serverId, key);
    if (variable) {
        return variable.destroy();
    }
};
