import { LinkPreset, type NavBarLink } from "@/types/config";

export const LinkPresets: { [key in LinkPreset]: NavBarLink } = {
    [LinkPreset.Home]: {
        name: "主页",
        url: "/",
        icon: "material-symbols:home",
    },
    [LinkPreset.About]: {
        name: "关于我",
        url: "/about/",
        icon: "material-symbols:person",
    },
    [LinkPreset.Archive]: {
        name: "归档",
        url: "/archive/",
        icon: "material-symbols:archive",
    },
    [LinkPreset.Friends]: {
        name: "友链",
        url: "/friends/",
        icon: "material-symbols:group",
    },
    [LinkPreset.Sponsor]: {
        name: "赞助",
        url: "/sponsor/",
        icon: "material-symbols:favorite",
    },
    [LinkPreset.Guestbook]: {
        name: "留言",
        url: "/guestbook/",
        icon: "material-symbols:chat",
    },
    [LinkPreset.Bangumi]: {
        name: "番组计划",
        url: "/bangumi/",
        icon: "material-symbols:movie",
    },
    [LinkPreset.Gallery]: {
        name: "相册",
        url: "/gallery/",
        icon: "material-symbols:photo-library",
    },
};
