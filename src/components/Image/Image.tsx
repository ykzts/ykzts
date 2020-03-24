import clsx from 'clsx'
import React, { FC } from 'react'

type Props = {
  alt?: string
  className?: string
  height?: number
  placeholder?: string
  src: string
  width?: number
}

const Image: FC<Props> = ({
  alt,
  className,
  height,
  placeholder,
  src,
  width
}) => (
  <>
    <div className={clsx('image', className)}>
      {placeholder ? (
        <img
          alt=""
          className="image__placeholder"
          src={placeholder}
          height={height}
          width={width}
        />
      ) : (
        <div className="image__placeholder" />
      )}

      <img
        alt={alt}
        height={height}
        className="image__actual-image"
        loading="lazy"
        src={src}
        width={width}
      />
    </div>

    <style jsx>{`
      .image {
        background-color: #fff;
        background-repeat: no-repeat;
        background-size: cover;
        display: inline-block;
        overflow: hidden;
        position: relative;
        width: 100%;
      }

      .image__placeholder,
      .image__actual-image {
        display: block;
        height: 100%;
        object-fit: cover;
        position: absolute;
        width: 100%;
      }

      .image__placeholder {
        background-color: #fff;
        filter: blur(50px);
      }
    `}</style>
  </>
)

export default Image
