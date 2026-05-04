declare module "animejs" {
  interface AnimeParams {
    targets?: any;
    duration?: number;
    easing?: string;
    delay?: number;
    translateX?: number | string;
    translateY?: number | string;
    [key: string]: any;
  }

  function anime(params: AnimeParams): anime.AnimeInstance;

  namespace anime {
    interface AnimeInstance {
      play: () => void;
      pause: () => void;
      restart: () => void;
      reverse: () => void;
      seek: (time: number) => void;
      set: (target: any, value: any) => void;
    }
    function set(target: any, properties: any): void;
    function timeline(params?: AnimeParams): AnimeInstance;
  }

  export = anime;
}