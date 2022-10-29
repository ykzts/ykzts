import Image from 'next/legacy/image'
import { type FC } from 'react'
import { FaArrowDown } from 'react-icons/fa'
import { Link as ScrollLink } from 'react-scroll'
import css from 'styled-jsx/css'
import keyVisual from '../../assets/key-visual.jpg'
import Section, {
  SectionContent,
  SectionHeader,
  SectionTagline,
  SectionTitle
} from '../Section'

const { className: arrowClassName, styles: arrowStyles } = css.resolve`
  a {
    border-bottom: 0;
    display: inline-block;
    font-size: 4rem;
    height: 4rem;
    position: relative;
    width: 6rem;
  }
`

const Intro: FC = () => (
  <>
    <Section intro>
      <SectionHeader>
        <SectionTitle>{'ykzts\u200b.com'}</SectionTitle>

        <SectionTagline>
          ソフトウェア開発者 山岸和利の
          <br />
          ポートフォリオ
        </SectionTagline>

        <ul className="actions">
          <li className="actions__item">
            <ScrollLink
              aria-label="コンテンツまでスクロール"
              className={arrowClassName}
              href="#content"
              offset={-100}
              role="button"
              smooth
              to="content"
            >
              <FaArrowDown />
            </ScrollLink>
          </li>
        </ul>
      </SectionHeader>

      <SectionContent>
        <Image
          alt=""
          layout="fill"
          objectFit="cover"
          placeholder="blur"
          sizes="(max-width: 1280px) 50vw,100vw"
          src={keyVisual}
        />
      </SectionContent>
    </Section>

    <style jsx>{`
      .actions {
        cursor: default;
        display: flex;
        justify-content: flex-end;
        list-style: none;
        margin-left: auto;
        margin-top: -1rem;
        padding-left: 0;
        width: 20rem;
      }

      @media (max-width: 1152px) {
        .actions {
          display: none;
        }
      }

      .actions__item {
        padding: 0 0 0 1rem;
        vertical-align: middle;
      }

      .actions__item:first-child {
        padding-left: 0;
      }

      @media (max-width: 480px) {
        .actions__item {
          flex-grow: 1;
          flex-shrink: 1;
          padding: 1rem 0 0 0;
          text-align: center;
          width: 100%;
        }
      }
    `}</style>

    {arrowStyles}
  </>
)

export default Intro
