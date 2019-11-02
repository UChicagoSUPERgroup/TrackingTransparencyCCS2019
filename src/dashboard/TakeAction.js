import React from 'react';

import Heading from '@instructure/ui-elements/lib/components/Heading';
import Text from '@instructure/ui-elements/lib/components/Text';
import Checkbox from '@instructure/ui-forms/lib/components/Checkbox';

import logging from './dashboardLogging';

const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1

export class TakeActionPage extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
    }
  }

  async componentDidMount () {
    let activityType = 'load take action page';
    logging.logLoad(activityType, {});
  }

  render () {
    const {numTrackers, numInferences, numPages} = this.state;
    return (
      <div>
        <div>
          <Heading level='h1'>Take Action</Heading>
          <Text>
            <p>We hope that you have learned something about online tracking by using our extension.</p>
          </Text>
          <Text>
            <p>Although our extension does <em>not</em> change the operation of your browser, you can take action regarding online tracking using third-party tools and exercising choices that advertisers provide. On this page, we list a number of options you could take. Please let us know if you plan to take any of these actions (or already do), as it will help us understand the impact of our extension. We may add your selections as features in the future.</p>
          </Text>
        </div>

        <div>
          <Heading level='h2' border='top' margin='medium none none none'>Block trackers</Heading>
          <Text>
            <p>Several browser extensions serve as tracker blockers. These extensions prevent advertisers and other third-party services from tracking where and what you browse. Examples include <a href='https://www.eff.org/privacybadger' target='_blank' rel='noopener noreferrer'>Privacy Badger</a> and the <a href='https://duckduckgo.com/app' target='_blank' rel='noopener noreferrer'>DuckDuckGo extension</a>. Some ad-blocking services may have this feature as well.</p>
            {isFirefox && <p>In Firefox, you can enable the built-in tracking protection feature. See <a href='https://support.mozilla.org/en-US/kb/tracking-protection' target='_blank' rel='noopener noreferrer'>here</a> for directions.</p>}
          </Text>
          <Checkbox label='I would use a tracker blocker.' value='medium' />
          <br />
        </div>

        <div>
          <Heading level='h2' border='top' margin='medium none none none'>Opt-out cookies</Heading>
          <Text>
            <p>Cookies are pieces of data maintained by the web browser to store information about the way you browse. They may be used to track you as well. Many advertisers give you the option to "opt out" of cookie tracking. You can learn more and opt-out <a href='http://optout.aboutads.info/' target='_blank' rel='noopener noreferrer'>here</a>.</p>
          </Text>
          <Checkbox label='I would opt-out of tracking cookies.' value='medium' />
          <br />
        </div>

        <div>
          <Heading level='h2' border='top' margin='medium none none none'>Do Not Track (DNT) setting</Heading>
          <Text>
            <p>Do Not Track (DNT) is a browser setting that sends the request <q>I don&#39;t want to be tracked</q> with every website you visit. It’s a setting in your browser preferences. However, few companies respect this request. You can learn more about DNT and how to set it <a href='https://allaboutdnt.com/' target='_blank' rel='noopener noreferrer'>here</a>.</p>
          </Text>
          <Checkbox label='I would enable the DNT setting.' value='medium' />
          <br />
        </div>

        <div>
          <Heading level='h2' border='top' margin='medium none none none'>Data broker profiles</Heading>
          <Text>
            <p>Data brokers are third-parties that collect data about you when you use your browser. To prevent these third-parties from collecting information about you and remove any profiles they may already have of you, you can follow <a href='https://www.the-parallax.com/2016/04/07/how-to-clean-up-or-delete-data-brokers-profiles-of-you/' target='_blank' rel='noopener noreferrer'>this article</a>.</p>
          </Text>
          <Checkbox label='I would adjust the profile that data brokers have about me.' value='medium' />
          <br />
        </div>

      </div>

    )
  }
}

export default TakeActionPage;
