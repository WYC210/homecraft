export default {
  name: 'Wyc',
  // 64×64 PNG, 4px arms, ≤ 18000 bytes. docs/avatar.md
  skin: '',
  languages: ['zh', 'en'],
  weather: { city: '上海', cityEn: 'Shanghai', latitude: 31.23, longitude: 121.47, timezone: 'Asia/Shanghai' },
  start: { weather: 'auto', time: 'auto' },
  dock: ['blog', 'about', 'mailbox', 'phone'],
  // Optional NPC based on the showcase character.
  resident: { enabled: true, name: 'Terry', skin: 'assets/terry-skin.png' },
  computer: {
    apps: [
      { id: 'github', name: 'GitHub', en: 'GitHub', category: 'dev', icon: 'github', url: 'https://github.com/WYC210' },
      { id: 'game-1', name: '我的游戏 1', en: 'My game 1', category: 'games', icon: 'works', url: '' },
      { id: 'game-2', name: '我的游戏 2', en: 'My game 2', category: 'games', icon: 'works', url: '' },
      { id: 'game-3', name: '我的游戏 3', en: 'My game 3', category: 'games', icon: 'works', url: '' },
    ],
  },
  mailbox: { endpoint: '', email: 'wyc@linux.do', turnstileSitekey: '' },
  badge: true,
};
