import * as React from 'react';
import { color } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';

import { TiledHeader as Header } from './Header';
import { TiledHeaderItem as Item } from './HeaderItem';

type HeaderProps = Record<string, unknown>;

const colorsGroup = {
    left: 'Left Colors',
    center: 'Center Colors',
    right: 'Right Colors',
};

const stories = storiesOf('TiledHeader', module).addParameters({ component: (Item as React.ReactNode) });

const TiledHeader = (props: HeaderProps) => React.createElement(Header, props);
const TiledHeaderItem = (props: HeaderProps) => React.createElement(Item, props);

stories.add('Default', () => {
    return (
        <TiledHeader>
            <TiledHeaderItem
                col={16}
                positions={{ alignY: 'center', primary: 'flex-start', secondary: 'flex-start' }}
                colors={{
                    bg: color('Left Background', '#FFF', colorsGroup.left),
                    primary: color('Left Primary', 'grey', colorsGroup.left),
                    secondary: color('Left Secondary', '#000', colorsGroup.left),
                }}
                primary={'ENTITY COUNT:'}
                secondary={'4'}
            />
            <TiledHeaderItem
                col={16}
                positions={{ alignY: 'center', primary: 'flex-start', secondary: 'flex-start' }}
                colors={{
                    bg: color('Center Background', '#FFF', colorsGroup.center),
                    primary: color('Center Primary', 'grey', colorsGroup.center),
                    secondary: color('Center Secondary', '#000', colorsGroup.center),
                }}
                primary={'CREATED ON:'}
                secondary={'03-mar-2020'}
            />
            <TiledHeaderItem
                col={16}
                positions={{ alignY: 'center', primary: 'flex-start', secondary: 'flex-start' }}
                colors={{
                    bg: color('Right Background', '#fcb700', colorsGroup.right),
                    primary: color('Right Primary', 'grey', colorsGroup.right),
                    secondary: color('Right Secondary', '#fff', colorsGroup.right),
                }}
                primary={'STATUS:'}
                secondary={'IN-PROGRESS'}
            />
        </ TiledHeader>
    );
});
