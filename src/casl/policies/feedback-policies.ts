import { Injectable } from '@nestjs/common';
import { AppAbility } from '../casl-ability.factory';
import { Action } from '../action.enum';

@Injectable()
export class FeedbackPolicies {
  static read(ability: AppAbility) {
    return ability.can(Action.Read, 'feedbacks');
  }
  static create(ability: AppAbility) {
    return ability.can(Action.Create, 'feedbacks');
  }
  static update(ability: AppAbility) {
    return ability.can(Action.Update, 'feedbacks');
  }
  static delete(ability: AppAbility) {
    return ability.can(Action.Delete, 'feedbacks');
  }
}
