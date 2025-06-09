import { AbilityBuilder, PureAbility } from '@casl/ability';
import { Action } from './action.enum';
import { Role, User } from 'src/users/entities/user.entity';

type Subject = 'users' | 'feedbacks' | 'mechanics' | 'services' | 'all';

export type AppAbility = PureAbility<[Action, Subject]>;

@injectable()
export class CaslAbilityFactory {
    createForUser(user: User): AppAbility{
        const {can, build} = new AbilityBuilder<AppAbility>(PureAbility);

        if(user.role === Role.ADMIN){
            can(Action.Manage, 'all')
        }
        else if (user.role === Role.USER){
            can(Action.Read,[
                'feedbacks',
                'mechanics',
                'services',
            ])
            can(Action.Create, 'feedbacks');

        }else if (user.role === Role.MECHANIC){
            can(Action.Read,[])
    }
