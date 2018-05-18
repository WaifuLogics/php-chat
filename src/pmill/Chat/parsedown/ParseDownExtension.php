<?php
namespace pmill\Chat\parsedown;

use Parsedown;

class ParseDownExtension extends Parsedown
{

    protected function inlineUrl($Excerpt)
    {
        $link = parent::inlineUrl($Excerpt);
        $link['element']['attributes']['target'] = '_blank';
        return $link;
    }

    protected function inlineLink($Excerpt) {
        $link = parent::inlineLink($Excerpt);
        $link['element']['attributes']['target'] = '_blank';
        return $link;
    }

    protected function inlineImage($Excerpt) {
        $image =  parent::inlineImage($Excerpt);

        $image['element']['attributes']['style'] = "width: 500px;";

        return $image;
    }
}