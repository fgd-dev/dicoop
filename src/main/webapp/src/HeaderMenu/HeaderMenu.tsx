import { ActionIcon, Group, Menu, Modal } from "@mantine/core";
import { BookOpenIcon, GearIcon, GithubLogoIcon, QuestionMarkIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function HeaderMenu() {
  const { t, i18n } = useTranslation();
  const languages = {
    en: { nativeName: "English" },
    fr: { nativeName: "Français" },
  };
  const iconStyle = {
    color: "black",
    display: "inline-flex",
  };
  const iconButtonStyle = {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    padding: "4px",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.2s",
  };
  const [aboutOpened, setAboutOpened] = useState(false);
  return (
    <>
      <Group mr={8} gap="xs" style={{ marginLeft: "auto" }}>
        <button
          title={t("settingsMenu.about")}
          style={iconButtonStyle}
          onClick={() => setAboutOpened(true)}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#e0e0e0")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <QuestionMarkIcon size={26} weight="bold" style={iconStyle} />
        </button>
        <a
          href={t("settingsMenu.guideFileName")}
          target="_blank"
          rel="noreferrer"
          title={t("settingsMenu.guide")}
          style={iconButtonStyle}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#e0e0e0")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <BookOpenIcon size={26} weight="bold" style={iconStyle} />
        </a>
        <a
          href="https://github.com/fgd-dev/dicoop"
          target="_blank"
          rel="noreferrer"
          title={t("settingsMenu.sourceCode")}
          style={iconButtonStyle}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#e0e0e0")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <GithubLogoIcon size={26} weight="bold" style={iconStyle} />
        </a>
        <Menu shadow="md" width={150}>
          <Menu.Target>
            <ActionIcon 
              title={t("settingsMenu.title")} 
              variant="subtle" 
              color="gray" 
              size="lg"
              style={{ padding: "4px" }}
            >
              <GearIcon size={24} weight="bold" />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>{t("settingsMenu.language")}</Menu.Label>
            {Object.keys(languages).map((lng) => (
              <Menu.Item
                key={lng}
                onClick={() => i18n.changeLanguage(lng)}
                fw={i18n.resolvedLanguage === lng ? "bold" : "normal"}
              >
                {languages[lng].nativeName}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
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
          >
            <GithubLogoIcon size={26} weight="bold" style={iconStyle} />
          </a>
        </p>
      </Modal>
    </>
  );
}