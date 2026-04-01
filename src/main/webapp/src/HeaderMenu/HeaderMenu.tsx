import { ActionIcon, Center, Group, Modal } from "@mantine/core";
import {
  BookIcon,
  GearIcon,
  MarkGithubIcon,
  QuestionIcon,
} from "@primer/octicons-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function HeaderMenu() {
  const { t, i18n } = useTranslation();
  const languages = {
    en: { nativeName: "English" },
    fr: { nativeName: "Français" },
  };
  const centerIconStyle = {
    color: "black",
  };
  const [aboutOpened, setAboutOpened] = useState(false);
  const [menuOpened, setMenuOpened] = useState(false);
  return (
    <>
      <Group mr={8} style={{ marginLeft: "auto" }}>
        <button
          title={t("settingsMenu.about")}
          style={{
            border: "none",
            background: "none",
            cursor: "pointer",
          }}
          onClick={() => setAboutOpened(true)}
        >
          <Center style={centerIconStyle}>
            <QuestionIcon size={26} />
          </Center>
        </button>
        <a
          href={t("settingsMenu.guideFileName")}
          target="_blank"
          rel="noreferrer"
          title={t("settingsMenu.guide")}
        >
          <Center style={centerIconStyle}>
            <BookIcon size={26} />
          </Center>
        </a>
        <a
          href="https://github.com/fgd-dev/dicoop"
          target="_blank"
          rel="noreferrer"
          title={t("settingsMenu.sourceCode")}
        >
          <Center style={centerIconStyle}>
            <MarkGithubIcon size={26} />
          </Center>
        </a>
        <div style={{ position: "relative" }}>
          <ActionIcon 
            title={t("settingsMenu.title")}
            onClick={() => setMenuOpened(!menuOpened)}
          >
            <Center style={centerIconStyle}>
              <GearIcon size={26} />
            </Center>
          </ActionIcon>
          {menuOpened && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                background: "white",
                border: "1px solid #ccc",
                borderRadius: "4px",
                padding: "8px",
                zIndex: 1000,
                minWidth: "120px",
              }}
            >
              <div style={{ fontWeight: "bold", padding: "4px 8px" }}>
                {t("settingsMenu.language")}
              </div>
              {Object.keys(languages).map((lng) => (
                <div
                  key={lng}
                  onClick={() => {
                    i18n.changeLanguage(lng);
                    setMenuOpened(false);
                  }}
                  style={{
                    padding: "4px 8px",
                    cursor: "pointer",
                    fontWeight: i18n.resolvedLanguage === lng ? "bold" : "normal",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f0f0")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {languages[lng].nativeName}
                </div>
              ))}
            </div>
          )}
        </div>
      </Group>
      <Modal
        size="75%"
        opened={aboutOpened}
        onClose={() => setAboutOpened(false)}
        title={t("settingsMenu.about")}
      >
        <p>{t("settingsMenu.aboutText1")}</p>
        <p>{t("settingsMenu.aboutText2")}</p>
        <p>{t("settingsMenu.aboutText3")}</p>
        <p>{t("settingsMenu.aboutText4")}</p>
        <p>{t("settingsMenu.aboutText5")}</p>
        <p>
          {t("settingsMenu.aboutText6")}{" "}
          <a
            href="https://github.com/fgd-dev/dicoop"
            target="_blank"
            rel="noreferrer"
            title={t("settingsMenu.sourceCode")}
            style={centerIconStyle}
          >
            <MarkGithubIcon size={26} />
          </a>
        </p>
      </Modal>
    </>
  );
}