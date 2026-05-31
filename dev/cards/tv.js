export default {
  id: 'tv',
  label: '📺 TV Remote',
  tag: 'sci-fi-tv',
  config: {
    type: 'custom:sci-fi-tv',
    entity: 'media_player.bravia_4k_vh22',
    name: 'PLANET ORBIT EXIT',
    sources: [
      {
        name: 'Netflix',
        action: 'call-service',
        service: 'media_player.play_media',
        data: {
          entity_id: 'media_player.bravia_4k_vh22',
          media_content_type: 'app',
          media_content_id: 'com.netflix.ninja'
        }
      },
      {
        name: 'YouTube',
        action: 'call-service',
        service: 'media_player.play_media',
        data: {
          entity_id: 'media_player.bravia_4k_vh22',
          media_content_type: 'app',
          media_content_id: 'com.google.android.youtube.tv'
        }
      },
      {
        name: 'Prime Video',
        action: 'call-service',
        service: 'media_player.play_media',
        data: {
          entity_id: 'media_player.bravia_4k_vh22',
          media_content_type: 'app',
          media_content_id: 'com.amazon.amazonvideo.livingroom'
        }
      },
      {
        name: 'Disney+',
        action: 'call-service',
        service: 'media_player.play_media',
        data: {
          entity_id: 'media_player.bravia_4k_vh22',
          media_content_type: 'app',
          media_content_id: 'com.disney.disneyplus'
        }
      },
      'HDMI 1'
    ],
    custom_actions: {
      up: { action: 'call-service', service: 'remote.send_command', data: { entity_id: 'remote.bravia_4k_vh22', command: 'DPAD_UP' } },
      down: { action: 'call-service', service: 'remote.send_command', data: { entity_id: 'remote.bravia_4k_vh22', command: 'DPAD_DOWN' } },
      left: { action: 'call-service', service: 'remote.send_command', data: { entity_id: 'remote.bravia_4k_vh22', command: 'DPAD_LEFT' } },
      right: { action: 'call-service', service: 'remote.send_command', data: { entity_id: 'remote.bravia_4k_vh22', command: 'DPAD_RIGHT' } },
      confirm: { action: 'call-service', service: 'remote.send_command', data: { entity_id: 'remote.bravia_4k_vh22', command: 'DPAD_CENTER' } },
      back: { action: 'call-service', service: 'remote.send_command', data: { entity_id: 'remote.bravia_4k_vh22', command: 'BACK' } },
      home: { action: 'call-service', service: 'remote.send_command', data: { entity_id: 'remote.bravia_4k_vh22', command: 'HOME' } },
      menu: { action: 'call-service', service: 'remote.send_command', data: { entity_id: 'remote.bravia_4k_vh22', command: 'MENU' } }
    }
  },
  scenarios: {
    'tv_off': {
      'media_player.bravia_4k_vh22': {
        state: 'off',
        attributes: {
          volume_level: 0.0,
          source: null,
          media_title: null,
          friendly_name: 'Bravia 4K TV'
        }
      },
      'remote.bravia_4k_vh22': {
        state: 'off',
        attributes: {
          friendly_name: 'Bravia Remote'
        }
      }
    },
    'netflix_active': {
      'media_player.bravia_4k_vh22': {
        state: 'on',
        attributes: {
          volume_level: 0.35,
          source: 'Netflix',
          media_title: 'Stranger Things',
          friendly_name: 'Bravia 4K TV'
        }
      },
      'remote.bravia_4k_vh22': {
        state: 'on',
        attributes: {
          friendly_name: 'Bravia Remote'
        }
      }
    },
    'youtube_active': {
      'media_player.bravia_4k_vh22': {
        state: 'on',
        attributes: {
          volume_level: 0.5,
          source: 'YouTube',
          media_title: 'Tech Review',
          friendly_name: 'Bravia 4K TV'
        }
      },
      'remote.bravia_4k_vh22': {
        state: 'on',
        attributes: {
          friendly_name: 'Bravia Remote'
        }
      }
    },
    'tv_unavailable': {
      'media_player.bravia_4k_vh22': {
        state: 'unavailable',
        attributes: {
          friendly_name: 'Bravia 4K TV'
        }
      },
      'remote.bravia_4k_vh22': {
        state: 'unavailable',
        attributes: {
          friendly_name: 'Bravia Remote'
        }
      }
    },
  }
};
