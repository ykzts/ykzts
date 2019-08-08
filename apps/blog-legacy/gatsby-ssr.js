const React = require('react')

exports.onRenderBody = ({ setHeadComponents, setPostBodyComponents }) => {
  setHeadComponents([
    <link
      as="style"
      href="https://fonts.googleapis.com/css?display=swap&amp;family=Roboto:400,700"
      key="font-roboto"
      rel="preload"
    />,
    <link
      as="style"
      href="https://fonts.googleapis.com/css?display=swap&amp;family=Noto+Sans+JP:400,700"
      key="font-noto-sans-jp"
      rel="preload"
    />,
    <link
      as="style"
      href="https://fonts.googleapis.com/css?display=swap&amp;family=Material+Icons"
      key="font-material-icons"
      rel="preload"
    />,
    <script
      async
      key="google-adsense"
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
    />
  ])

  setPostBodyComponents([
    <link
      href="https://fonts.googleapis.com/css?display=swap&amp;family=Roboto:400,700"
      key="font-roboto"
      rel="stylesheet"
    />,
    <link
      href="https://fonts.googleapis.com/css?display=swap&amp;family=Noto+Sans+JP:400,700"
      key="font-noto-sans-jp"
      rel="stylesheet"
    />,
    <link
      href="https://fonts.googleapis.com/css?display=swap&amp;family=Material+Icons"
      key="font-material-icons"
      rel="stylesheet"
    />
  ])
}
