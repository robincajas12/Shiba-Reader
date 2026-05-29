import { Repository } from './BaseRepository';
import { Prueba, TablePrueba } from '../schemas/Prueba';

export class PruebaRepository extends Repository<Prueba> {
    constructor() {
        super(TablePrueba);
    }
}
