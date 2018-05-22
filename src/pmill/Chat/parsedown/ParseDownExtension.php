<?php
namespace pmill\Chat\parsedown;

use Parsedown;

class ParseDownExtension extends Parsedown
{

    protected function inlineUrl($Excerpt)
    {
        $link = parent::inlineUrl($Excerpt);
        if(is_null($link))
            return;

        $link['element']['attributes']['target'] = '_blank';
        return $link;
    }

    protected function inlineLink($Excerpt) {
        $link = parent::inlineLink($Excerpt);

        if(is_null($link))
            return;

        $link['element']['attributes']['target'] = '_blank';
        return $link;
    }

    protected function inlineImage($Excerpt) {
        $image =  parent::inlineImage($Excerpt);

        if(is_null($image))
            return;

        $image['element']['attributes']['style'] = "max-width: 500px;";

        return $image;
    }
}