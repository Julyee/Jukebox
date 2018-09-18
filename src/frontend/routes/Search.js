import { Layout } from '../Layout';
import m from 'mithril';

export class Search extends Layout {
    content() {
        const parsedUrl = new URL(`about:blank${window.location.hash.substr(2)}`);
        return m('div', `Search: ${parsedUrl.searchParams.get('q')}`);
    }
}
